import { useState } from 'react';
import { toDatetimeLocal } from '../utils';

const RASH_LEVELS = [
  { value: 'none',   label: '✅ None',   color: 'bg-green-100 border-green-300' },
  { value: 'mild',   label: '🟡 Mild',   color: 'bg-yellow-100 border-yellow-300' },
  { value: 'moderate', label: '🟠 Moderate', color: 'bg-orange-100 border-orange-300' },
  { value: 'severe', label: '🔴 Severe', color: 'bg-red-100 border-red-300' },
];

export default function DiaperCareModal({ onClose, onSave, event }) {
  const isEdit = !!event;
  const [rashLevel, setRashLevel] = useState(event?.rashLevel || '');
  const [ointmentApplied, setOintmentApplied] = useState(event?.ointmentApplied ?? null);
  const [ointmentName, setOintmentName] = useState(event?.ointmentName || '');
  const [notes, setNotes] = useState(event?.notes || '');
  const [eventTime, setEventTime] = useState(toDatetimeLocal(event?.createdAt || new Date().toISOString()));

  const handleSave = () => {
    onSave({
      rashLevel: rashLevel || undefined,
      ointmentApplied: ointmentApplied === null ? undefined : ointmentApplied,
      ointmentName: ointmentApplied && ointmentName.trim() ? ointmentName.trim() : undefined,
      notes: notes.trim() || undefined,
    }, new Date(eventTime).toISOString());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm"
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-[480px] bg-white rounded-t-3xl shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-800">{isEdit ? '✏️ Edit Diaper Care' : '🧴 Diaper Care'}</h2>
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
            <label className="block text-sm font-medium text-gray-600 mb-2">Diaper Rash?</label>
            <div className="grid grid-cols-2 gap-2">
              {RASH_LEVELS.map(r => (
                <button key={r.value} onClick={() => setRashLevel(r.value)}
                  className={`py-2.5 rounded-xl text-sm font-medium border-2 transition-all
                    ${rashLevel === r.value ? r.color : 'bg-gray-50 border-transparent text-gray-600'}`}>
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">Ointment Applied?</label>
            <div className="flex gap-2">
              {[{ v: true, l: '✅ Yes' }, { v: false, l: '❌ No' }].map(o => (
                <button key={String(o.v)} onClick={() => setOintmentApplied(o.v)}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-medium
                    ${ointmentApplied === o.v ? 'bg-violet-600 text-white' : 'bg-gray-100 text-gray-600'}`}>
                  {o.l}
                </button>
              ))}
            </div>
          </div>

          {ointmentApplied && (
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">Which ointment? (optional)</label>
              <input type="text" value={ointmentName} onChange={e => setOintmentName(e.target.value)}
                placeholder="e.g. Desitin, Aquaphor..."
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm" />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">Notes (optional)</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)}
              placeholder="Any observations..." rows={2}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm resize-none" />
          </div>

          <button onClick={handleSave}
            className="w-full bg-violet-600 text-white py-3.5 rounded-2xl font-semibold active:scale-95 transition-transform">
            {isEdit ? 'Save Changes' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}
