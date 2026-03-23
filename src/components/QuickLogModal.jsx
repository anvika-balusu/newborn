import { useState } from 'react';
import { toDatetimeLocal } from '../utils';

const POOP_COLORS = [
  { value: 'yellow',  label: '🟡 Yellow',  bg: 'bg-yellow-100' },
  { value: 'mustard', label: '🟠 Mustard', bg: 'bg-orange-100' },
  { value: 'brown',   label: '🟤 Brown',   bg: 'bg-amber-200'  },
  { value: 'green',   label: '🟢 Green',   bg: 'bg-green-100'  },
  { value: 'black',   label: '⚫ Black',   bg: 'bg-gray-300'   },
  { value: 'red',     label: '🔴 Red',     bg: 'bg-red-100'    },
  { value: 'white',   label: '⚪ White',   bg: 'bg-gray-100'   },
];

const POOP_TEXTURES = [
  { value: 'watery', label: 'Watery' },
  { value: 'seedy',  label: 'Seedy'  },
  { value: 'soft',   label: 'Soft'   },
  { value: 'formed', label: 'Formed' },
  { value: 'hard',   label: 'Hard'   },
];

// Works for both poop (type='poop') and pee (type='pee')
// event = existing event when editing
export default function QuickLogModal({ title, type = 'poop', onClose, onSave, event }) {
  const isEdit = !!event;
  const [poopColor, setPoopColor] = useState(event?.poopColor || '');
  const [texture, setTexture] = useState(event?.texture || '');
  const [notes, setNotes] = useState(event?.notes || '');
  const [eventTime, setEventTime] = useState(toDatetimeLocal(event?.createdAt || new Date().toISOString()));

  const handleSave = (extra = {}) => {
    onSave({
      poopColor: poopColor || undefined,
      texture: texture || undefined,
      notes: notes.trim() || undefined,
      ...extra,
    }, new Date(eventTime).toISOString());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm"
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-[480px] bg-white rounded-t-3xl shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-800">{isEdit ? `✏️ Edit ${title}` : title}</h2>
          <button onClick={onClose} className="text-2xl text-gray-400">✕</button>
        </div>

        <div className="px-5 py-4 space-y-4 pb-8">
          {/* Time picker */}
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

          {type === 'pee' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">Notes (optional)</label>
                <textarea value={notes} onChange={e => setNotes(e.target.value)}
                  placeholder="Any observations..." rows={2}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm resize-none" />
              </div>
              <button onClick={() => handleSave()}
                className="w-full bg-sky-500 text-white py-3.5 rounded-2xl font-semibold active:scale-95 transition-transform">
                {isEdit ? 'Save Changes' : '💧 Save Pee'}
              </button>
            </>
          )}

          {type === 'poop' && (
            <>
              {!isEdit && (
                <>
                  <button onClick={() => handleSave()}
                    className="w-full bg-amber-400 text-amber-900 py-4 rounded-2xl font-bold text-lg active:scale-95 transition-transform">
                    💩 Quick Save
                  </button>
                  <p className="text-center text-xs text-gray-400">— or add details below —</p>
                </>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">Color</label>
                <div className="grid grid-cols-4 gap-2">
                  {POOP_COLORS.map(c => (
                    <button key={c.value} onClick={() => setPoopColor(poopColor === c.value ? '' : c.value)}
                      className={`px-2 py-2 rounded-xl text-xs font-medium transition-all ${c.bg}
                        ${poopColor === c.value ? 'ring-2 ring-violet-500 ring-offset-1' : ''}`}>
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">Texture</label>
                <div className="flex gap-2 flex-wrap">
                  {POOP_TEXTURES.map(t => (
                    <button key={t.value} onClick={() => setTexture(texture === t.value ? '' : t.value)}
                      className={`px-3 py-1.5 rounded-xl text-sm font-medium
                        ${texture === t.value ? 'bg-violet-600 text-white' : 'bg-gray-100 text-gray-600'}`}>
                      {t.label}
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

              <button onClick={() => handleSave()}
                className="w-full bg-violet-600 text-white py-3.5 rounded-2xl font-semibold active:scale-95 transition-transform">
                {isEdit ? 'Save Changes' : 'Save with Details'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
