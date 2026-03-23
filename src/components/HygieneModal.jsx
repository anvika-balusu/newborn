import { useState } from 'react';
import { toDatetimeLocal } from '../utils';

const WASH_TYPES = [
  { value: 'full_bath',   emoji: '🛁', label: 'Full Bath',      desc: 'Complete wash in tub' },
  { value: 'sponge_bath', emoji: '🧽', label: 'Sponge / Duster', desc: 'Gentle wipe-down' },
  { value: 'butt_water',  emoji: '💦', label: 'Butt Wash',      desc: 'Water rinse only' },
  { value: 'wipe',        emoji: '🧻', label: 'Wipe',           desc: 'Baby wipe clean' },
];

export default function HygieneModal({ onClose, onSave, event }) {
  const isEdit = !!event;
  const [washType, setWashType] = useState(event?.washType || '');
  const [notes, setNotes] = useState(event?.notes || '');
  const [eventTime, setEventTime] = useState(toDatetimeLocal(event?.createdAt || new Date().toISOString()));

  const handleSave = () => {
    if (!washType) return;
    onSave({ washType, notes: notes.trim() || undefined }, new Date(eventTime).toISOString());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm"
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-[480px] bg-white rounded-t-3xl shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-800">{isEdit ? '✏️ Edit Hygiene' : '🛁 Hygiene'}</h2>
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
            <label className="block text-sm font-medium text-gray-600 mb-2">Type</label>
            <div className="grid grid-cols-2 gap-2">
              {WASH_TYPES.map(w => (
                <button key={w.value} onClick={() => setWashType(w.value)}
                  className={`flex items-center gap-3 px-3 py-3 rounded-2xl border-2 text-left transition-all active:scale-95
                    ${washType === w.value
                      ? 'border-teal-400 bg-teal-50'
                      : 'border-transparent bg-gray-50'}`}>
                  <span className="text-2xl">{w.emoji}</span>
                  <div>
                    <p className="text-sm font-semibold text-gray-800 leading-tight">{w.label}</p>
                    <p className="text-xs text-gray-400">{w.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">Notes (optional)</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)}
              placeholder="e.g. used baby soap..." rows={2}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm resize-none" />
          </div>

          <button onClick={handleSave} disabled={!washType}
            className="w-full bg-teal-500 disabled:opacity-40 text-white py-3.5 rounded-2xl font-semibold active:scale-95 transition-transform">
            {isEdit ? 'Save Changes' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}
