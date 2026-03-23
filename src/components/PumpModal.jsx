import { useState } from 'react';
import { toDatetimeLocal } from '../utils';

const QUICK_ML = [30, 60, 90, 120, 150, 180, 210, 240];

function MlPicker({ label, value, onChange }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-600 mb-2">{label}</label>
      <div className="flex gap-2 flex-wrap mb-2">
        {QUICK_ML.map(ml => (
          <button key={ml} onClick={() => onChange(String(ml))}
            className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-colors
              ${value === String(ml) ? 'bg-pink-500 text-white' : 'bg-gray-100 text-gray-600'}`}>
            {ml}ml
          </button>
        ))}
      </div>
      <input type="number" value={value} onChange={e => onChange(e.target.value)}
        placeholder="Custom (ml)"
        className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm" />
    </div>
  );
}

export default function PumpModal({ onClose, onSave, event }) {
  const isEdit = !!event;
  const [side, setSide] = useState(event?.side || 'both');
  const [leftMl, setLeftMl] = useState(event?.leftMl ? String(event.leftMl) : '');
  const [rightMl, setRightMl] = useState(event?.rightMl ? String(event.rightMl) : '');
  const [totalMl, setTotalMl] = useState(event?.quantity ? String(event.quantity) : '');
  const [duration, setDuration] = useState(event?.duration ? String(event.duration) : '');
  const [notes, setNotes] = useState(event?.notes || '');
  const [eventTime, setEventTime] = useState(toDatetimeLocal(event?.createdAt || new Date().toISOString()));

  const total = side === 'both'
    ? ((parseInt(leftMl) || 0) + (parseInt(rightMl) || 0)) || ''
    : (parseInt(totalMl) || '');

  const handleSave = () => {
    const data = {
      side,
      duration: duration ? parseInt(duration) : undefined,
      notes: notes.trim() || undefined,
    };
    if (side === 'both') {
      data.leftMl  = leftMl  ? parseInt(leftMl)  : undefined;
      data.rightMl = rightMl ? parseInt(rightMl) : undefined;
      data.quantity = (data.leftMl || 0) + (data.rightMl || 0) || undefined;
    } else {
      data.quantity = totalMl ? parseInt(totalMl) : undefined;
    }
    onSave(data, new Date(eventTime).toISOString());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm"
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-[480px] bg-white rounded-t-3xl shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-800">{isEdit ? '✏️ Edit Pump' : '🍼 Breast Pump'}</h2>
          <button onClick={onClose} className="text-2xl text-gray-400">✕</button>
        </div>

        <div className="px-5 py-4 space-y-4 pb-8">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">When</label>
            <input type="datetime-local" value={eventTime}
              onChange={e => setEventTime(e.target.value)}
              max={toDatetimeLocal(new Date().toISOString())}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">Side</label>
            <div className="flex gap-2">
              {[
                { value: 'left',  label: '⬅️ Left'  },
                { value: 'right', label: '➡️ Right' },
                { value: 'both',  label: '↔️ Both'  },
              ].map(o => (
                <button key={o.value} onClick={() => setSide(o.value)}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors
                    ${side === o.value ? 'bg-pink-500 text-white' : 'bg-gray-100 text-gray-600'}`}>
                  {o.label}
                </button>
              ))}
            </div>
          </div>

          {side === 'both' ? (
            <>
              <MlPicker label="⬅️ Left side (ml)" value={leftMl} onChange={setLeftMl} />
              <MlPicker label="➡️ Right side (ml)" value={rightMl} onChange={setRightMl} />
              {total > 0 && (
                <div className="bg-pink-50 rounded-2xl px-4 py-3 text-center">
                  <p className="text-xs text-pink-400 font-medium">Total pumped</p>
                  <p className="text-3xl font-black text-pink-600">{total}<span className="text-base font-medium ml-1">ml</span></p>
                </div>
              )}
            </>
          ) : (
            <MlPicker label="Quantity (ml)" value={totalMl} onChange={setTotalMl} />
          )}

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">Duration (min, optional)</label>
            <input type="number" value={duration} onChange={e => setDuration(e.target.value)}
              placeholder="How long did you pump?"
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">Notes (optional)</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)}
              placeholder="e.g. low supply, engorged..." rows={2}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm resize-none" />
          </div>

          <button onClick={handleSave}
            className="w-full bg-pink-500 text-white py-3.5 rounded-2xl font-semibold active:scale-95 transition-transform">
            {isEdit ? 'Save Changes' : 'Save Pump Session'}
          </button>
        </div>
      </div>
    </div>
  );
}
