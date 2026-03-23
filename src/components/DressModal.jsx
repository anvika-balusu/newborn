import { useState } from 'react';
import { toDatetimeLocal } from '../utils';

const DRESS_TYPES = [
  {
    value: 'footie',
    emoji: '🧸',
    label: 'Footie / Sleepsuit',
    desc: 'Full body — hands, legs & feet covered',
    coverage: 'full',
  },
  {
    value: 'longsleeve_pants',
    emoji: '👕',
    label: 'Long Sleeve + Pants',
    desc: 'Hands ✓  Legs ✓  Feet ✗',
    coverage: 'full',
  },
  {
    value: 'shortsleeeve_pants',
    emoji: '🩱',
    label: 'Short Sleeve + Pants',
    desc: 'Hands ✗  Legs ✓  Feet ✗',
    coverage: 'legs',
  },
  {
    value: 'longsleeeve_shorts',
    emoji: '🧥',
    label: 'Long Sleeve + Shorts',
    desc: 'Hands ✓  Legs ✗  Feet ✗',
    coverage: 'hands',
  },
  {
    value: 'onesie_short',
    emoji: '👶',
    label: 'Onesie (Short Sleeve)',
    desc: 'Hands ✗  Legs ✗ — light outfit',
    coverage: 'minimal',
  },
  {
    value: 'swaddle',
    emoji: '🌯',
    label: 'Swaddle',
    desc: 'Wrapped up snug',
    coverage: 'swaddle',
  },
  {
    value: 'just_diaper',
    emoji: '🍑',
    label: 'Just Diaper',
    desc: 'Diaper only',
    coverage: 'none',
  },
];

const COVERAGE_COLORS = {
  full:    'border-violet-300 bg-violet-50',
  legs:    'border-blue-300   bg-blue-50',
  hands:   'border-teal-300   bg-teal-50',
  minimal: 'border-yellow-300 bg-yellow-50',
  swaddle: 'border-pink-300   bg-pink-50',
  none:    'border-gray-300   bg-gray-50',
};

export default function DressModal({ onClose, onSave, event }) {
  const isEdit = !!event;
  const [dressType, setDressType] = useState(event?.dressType || '');
  const [notes, setNotes] = useState(event?.notes || '');
  const [eventTime, setEventTime] = useState(
    toDatetimeLocal(event?.createdAt || new Date().toISOString())
  );

  const selected = DRESS_TYPES.find(d => d.value === dressType);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm"
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-[480px] bg-white rounded-t-3xl shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-800">{isEdit ? '✏️ Edit Dress Change' : '👗 Dress Change'}</h2>
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
            <label className="block text-sm font-medium text-gray-600 mb-2">Outfit Type</label>
            <div className="space-y-2">
              {DRESS_TYPES.map(d => (
                <button key={d.value} onClick={() => setDressType(d.value)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl border-2 text-left transition-all active:scale-[0.98]
                    ${dressType === d.value
                      ? COVERAGE_COLORS[d.coverage]
                      : 'border-transparent bg-gray-50'}`}>
                  <span className="text-2xl shrink-0">{d.emoji}</span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-800">{d.label}</p>
                    <p className="text-xs text-gray-400">{d.desc}</p>
                  </div>
                  {dressType === d.value && (
                    <span className="ml-auto text-violet-500 text-lg shrink-0">✓</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">Notes (optional)</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)}
              placeholder="e.g. pink elephant onesie, added socks..." rows={2}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm resize-none" />
          </div>

          <button
            onClick={() => onSave({ dressType, notes: notes.trim() || undefined }, new Date(eventTime).toISOString())}
            disabled={!dressType}
            className="w-full bg-violet-600 disabled:opacity-40 text-white py-3.5 rounded-2xl font-semibold active:scale-95 transition-transform">
            {isEdit ? 'Save Changes' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}
