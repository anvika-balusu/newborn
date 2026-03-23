import { useState, useEffect, useRef } from 'react';
import { toDatetimeLocal } from '../utils';

function ToggleGroup({ label, options, value, onChange }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-600 mb-2">{label}</label>
      <div className="flex gap-2 flex-wrap">
        {options.map(opt => (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors
              ${value === opt.value ? 'bg-violet-600 text-white' : 'bg-gray-100 text-gray-600'}`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// event = existing event when editing, null when adding new
export default function FeedModal({ onSave, onClose, event }) {
  const isEdit = !!event;
  const [feedType, setFeedType] = useState(event?.feedType || 'breast');
  const [side, setSide] = useState(event?.side || 'left');
  const [bottledQty, setBottledQty] = useState(event?.quantity ? String(event.quantity) : '');
  const [duration, setDuration] = useState(event?.duration ? String(event.duration) : '');
  const [quantity, setQuantity] = useState(event?.quantity ? String(event.quantity) : '');
  const [burped, setBurped] = useState(event?.burped ?? null);
  const [notes, setNotes] = useState(event?.notes || '');
  const [eventTime, setEventTime] = useState(toDatetimeLocal(event?.createdAt || new Date().toISOString()));
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerStarted, setTimerStarted] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (timerRunning) {
      intervalRef.current = setInterval(() => setTimerSeconds(s => s + 1), 1000);
    } else {
      clearInterval(intervalRef.current);
      if (timerStarted && timerSeconds > 0) setDuration(String(Math.ceil(timerSeconds / 60)));
    }
    return () => clearInterval(intervalRef.current);
  }, [timerRunning]);

  const toggleTimer = () => { if (!timerStarted) setTimerStarted(true); setTimerRunning(r => !r); };
  const resetTimer = () => { setTimerRunning(false); setTimerStarted(false); setTimerSeconds(0); setDuration(''); };
  const formatTimer = s => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  const handleSave = () => {
    const data = {
      feedType,
      burped: burped === null ? false : burped,
      notes: notes.trim() || undefined,
    };
    if (feedType === 'breast') {
      data.side = side;
      data.duration = duration ? parseInt(duration) : timerSeconds > 0 ? Math.ceil(timerSeconds / 60) : undefined;
    } else if (feedType === 'bottled_bm') {
      data.quantity = bottledQty ? parseInt(bottledQty) : undefined;
      data.duration = duration ? parseInt(duration) : undefined;
    } else {
      data.quantity = quantity ? parseInt(quantity) : undefined;
      data.duration = duration ? parseInt(duration) : undefined;
    }
    onSave(data, new Date(eventTime).toISOString());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm"
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-[480px] bg-white rounded-t-3xl shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-800">{isEdit ? '✏️ Edit Feed' : '🍼 Feed Log'}</h2>
          <button onClick={onClose} className="text-2xl text-gray-400">✕</button>
        </div>

        <div className="px-5 py-4 space-y-4 pb-8">
          {/* Time picker — always shown */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">When</label>
            <input
              type="datetime-local"
              value={eventTime}
              onChange={e => setEventTime(e.target.value)}
              max={toDatetimeLocal(new Date().toISOString())}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50"
            />
          </div>

          <ToggleGroup
            label="Type"
            value={feedType}
            onChange={setFeedType}
            options={[
              { value: 'breast',     label: '🤱 Breast'     },
              { value: 'bottled_bm', label: '🍶 Bottled BM' },
              { value: 'formula',    label: '🍼 Formula'    },
            ]}
          />

          {feedType === 'breast' && (
            <>
              <ToggleGroup
                label="Side"
                value={side}
                onChange={setSide}
                options={[
                  { value: 'left', label: '⬅️ Left' },
                  { value: 'right', label: '➡️ Right' },
                  { value: 'both', label: '↔️ Both' },
                ]}
              />
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">Duration</label>
                {!isEdit && (
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`text-3xl font-mono font-bold flex-1 text-center py-3 rounded-xl
                      ${timerRunning ? 'bg-violet-100 text-violet-700' : 'bg-gray-100 text-gray-700'}`}>
                      {formatTimer(timerSeconds)}
                    </div>
                    <button onClick={toggleTimer}
                      className={`px-4 py-3 rounded-xl font-medium text-sm
                        ${timerRunning ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                      {timerRunning ? '⏸ Pause' : timerStarted ? '▶️ Resume' : '▶️ Start'}
                    </button>
                    {timerStarted && (
                      <button onClick={resetTimer} className="px-3 py-3 rounded-xl bg-gray-100 text-gray-500 text-sm">↺</button>
                    )}
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400">{isEdit ? 'Minutes:' : 'Or enter manually (min):'}</span>
                  <input type="number" value={duration} onChange={e => setDuration(e.target.value)}
                    placeholder="e.g. 15"
                    className="w-24 border border-gray-200 rounded-lg px-2 py-1.5 text-sm text-center" />
                </div>
              </div>
            </>
          )}

          {feedType === 'bottled_bm' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">Quantity (ml)</label>
                <div className="flex gap-2 flex-wrap mb-2">
                  {[30, 60, 90, 120, 150, 180].map(ml => (
                    <button key={ml} onClick={() => setBottledQty(String(ml))}
                      className={`px-3 py-1.5 rounded-xl text-sm font-medium
                        ${bottledQty === String(ml) ? 'bg-teal-500 text-white' : 'bg-gray-100 text-gray-600'}`}>
                      {ml}ml
                    </button>
                  ))}
                </div>
                <input type="number" value={bottledQty} onChange={e => setBottledQty(e.target.value)}
                  placeholder="Custom amount (ml)"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">Duration (min)</label>
                <input type="number" value={duration} onChange={e => setDuration(e.target.value)}
                  placeholder="How long did it take?"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm" />
              </div>
            </>
          )}

          {feedType === 'formula' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">Quantity (ml)</label>
                <div className="flex gap-2 flex-wrap mb-2">
                  {[30, 60, 90, 120, 150, 180].map(ml => (
                    <button key={ml} onClick={() => setQuantity(String(ml))}
                      className={`px-3 py-1.5 rounded-xl text-sm font-medium
                        ${quantity === String(ml) ? 'bg-rose-500 text-white' : 'bg-gray-100 text-gray-600'}`}>
                      {ml}ml
                    </button>
                  ))}
                </div>
                <input type="number" value={quantity} onChange={e => setQuantity(e.target.value)}
                  placeholder="Custom amount (ml)"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">Duration (min)</label>
                <input type="number" value={duration} onChange={e => setDuration(e.target.value)}
                  placeholder="How long did it take?"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm" />
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">Burped?</label>
            <div className="flex gap-2">
              {[{ value: true, label: '✅ Yes' }, { value: false, label: '❌ No' }].map(opt => (
                <button key={String(opt.value)} onClick={() => setBurped(opt.value)}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-medium
                    ${burped === opt.value ? 'bg-violet-600 text-white' : 'bg-gray-100 text-gray-600'}`}>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">Notes</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)}
              placeholder="Any observations..." rows={2}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm resize-none" />
          </div>

          <button onClick={handleSave}
            className="w-full bg-violet-600 text-white py-3.5 rounded-2xl font-semibold text-base active:scale-95 transition-transform">
            {isEdit ? 'Save Changes' : 'Save Feed Log'}
          </button>
        </div>
      </div>
    </div>
  );
}
