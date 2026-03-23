import { useState, useRef } from 'react';
import { exportCSV, exportJSON, parseImportFile, importFiltered, getEvents } from '../store';

const ALL_TYPES = [
  { type: 'pee',         emoji: '💧', label: 'Pee'         },
  { type: 'poop',        emoji: '💩', label: 'Poop'        },
  { type: 'feed',        emoji: '🍼', label: 'Feed'        },
  { type: 'sleep',       emoji: '😴', label: 'Sleep'       },
  { type: 'hygiene',     emoji: '🛁', label: 'Hygiene'     },
  { type: 'diaper_care', emoji: '🧴', label: 'Diaper Care' },
  { type: 'dress',       emoji: '👗', label: 'Dress'       },
  { type: 'pump',        emoji: '🍼', label: 'Mom Pump'    },
];

function TypeCheckboxes({ selected, onChange, counts }) {
  const toggle = (type) =>
    onChange(selected.includes(type) ? selected.filter(t => t !== type) : [...selected, type]);

  return (
    <div className="grid grid-cols-4 gap-2">
      {ALL_TYPES.map(({ type, emoji, label }) => {
        const count = counts?.[type];
        const checked = selected.includes(type);
        const available = !counts || count > 0; // grey out types with 0 events in import
        return (
          <button key={type} onClick={() => available && toggle(type)}
            className={`flex flex-col items-center gap-1 py-2.5 rounded-2xl border-2 transition-all
              ${checked && available ? 'border-violet-400 bg-violet-50' : 'border-transparent bg-gray-50'}
              ${!available ? 'opacity-30' : 'active:scale-95'}`}>
            <span className="text-xl">{emoji}</span>
            <span className="text-xs font-medium text-gray-600 leading-tight text-center">{label}</span>
            {counts && count > 0 && (
              <span className="text-xs font-bold text-violet-500">{count}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}

export default function SettingsModal({ onClose, onRefresh }) {
  const allTypes = ALL_TYPES.map(t => t.type);
  const eventCount = getEvents().length;

  // Export state
  const [exportTypes, setExportTypes] = useState(allTypes);

  // Import state
  const [importStep, setImportStep] = useState('idle'); // idle | preview | done
  const [importData, setImportData] = useState(null); // { events, typeCounts }
  const [importTypes, setImportTypes] = useState([]);
  const [importMsg, setImportMsg] = useState('');
  const [importError, setImportError] = useState('');

  const [confirmClear, setConfirmClear] = useState(false);
  const fileRef = useRef();

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    try {
      const data = await parseImportFile(file);
      setImportData(data);
      // Pre-select types that exist in the file
      setImportTypes(Object.keys(data.typeCounts));
      setImportStep('preview');
      setImportError('');
    } catch (err) {
      setImportError(err.message);
    }
  };

  const handleImportConfirm = () => {
    if (!importData || !importTypes.length) return;
    const added = importFiltered(importData.events, importTypes);
    setImportMsg(`Added ${added} new event${added !== 1 ? 's' : ''} (duplicates skipped)`);
    setImportStep('done');
    setImportData(null);
    onRefresh();
  };

  const handleClear = () => {
    localStorage.removeItem('avika_events');
    onRefresh();
    onClose();
  };

  const exportSelected = exportTypes.length === allTypes.length ? undefined : exportTypes;
  const exportLabel = exportTypes.length === allTypes.length
    ? 'All events'
    : `${exportTypes.length} type${exportTypes.length !== 1 ? 's' : ''} selected`;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm"
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-[480px] bg-white rounded-t-3xl shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-800">⚙️ Settings</h2>
          <button onClick={onClose} className="text-2xl text-gray-400">✕</button>
        </div>

        <div className="px-5 py-4 space-y-4 pb-8">
          {/* Stats */}
          <div className="bg-violet-50 rounded-2xl p-4">
            <p className="text-xs font-semibold text-violet-400 uppercase tracking-wide">Total logged</p>
            <p className="text-4xl font-black text-violet-700">{eventCount} <span className="text-base font-medium text-violet-400">events</span></p>
          </div>

          {/* ── EXPORT ── */}
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Export Data</p>

            <div className="bg-gray-50 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-gray-700">Select types to export</p>
                <div className="flex gap-2">
                  <button onClick={() => setExportTypes(allTypes)}
                    className="text-xs text-violet-500 font-medium">All</button>
                  <span className="text-gray-300">·</span>
                  <button onClick={() => setExportTypes([])}
                    className="text-xs text-gray-400 font-medium">None</button>
                </div>
              </div>
              <TypeCheckboxes selected={exportTypes} onChange={setExportTypes} />
              <p className="text-xs text-gray-400 text-center">{exportLabel}</p>

              <div className="flex gap-2 pt-1">
                <button onClick={() => exportCSV(exportSelected)} disabled={!exportTypes.length}
                  className="flex-1 flex items-center justify-center gap-2 bg-emerald-500 disabled:opacity-40 text-white py-3 rounded-xl font-semibold text-sm active:scale-95 transition-transform">
                  📊 CSV
                </button>
                <button onClick={() => exportJSON(exportSelected)} disabled={!exportTypes.length}
                  className="flex-1 flex items-center justify-center gap-2 bg-blue-500 disabled:opacity-40 text-white py-3 rounded-xl font-semibold text-sm active:scale-95 transition-transform">
                  💾 JSON
                </button>
              </div>
            </div>
          </div>

          {/* ── IMPORT ── */}
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Import Data</p>

            {importStep === 'idle' && (
              <button onClick={() => fileRef.current?.click()}
                className="w-full flex items-center gap-3 bg-amber-50 border border-amber-100 px-4 py-4 rounded-2xl active:scale-95 transition-transform text-left">
                <span className="text-2xl">📥</span>
                <div>
                  <p className="font-semibold text-amber-800 text-sm">Restore from JSON Backup</p>
                  <p className="text-xs text-amber-500">Choose which event types to merge in — no duplicates, no reset</p>
                </div>
              </button>
            )}

            {importStep === 'preview' && importData && (
              <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-amber-800">
                    Found {importData.events.length} events — pick types to import
                  </p>
                  <button onClick={() => setImportStep('idle')} className="text-gray-400 text-lg">✕</button>
                </div>
                <TypeCheckboxes
                  selected={importTypes}
                  onChange={setImportTypes}
                  counts={importData.typeCounts}
                />
                <p className="text-xs text-gray-400 text-center">
                  {importTypes.length === 0
                    ? 'Select at least one type'
                    : `${importData.events.filter(e => importTypes.includes(e.type)).length} events will be merged`}
                </p>
                <button onClick={handleImportConfirm} disabled={!importTypes.length}
                  className="w-full bg-amber-500 disabled:opacity-40 text-white py-3 rounded-xl font-semibold text-sm active:scale-95 transition-transform">
                  Merge Selected Events
                </button>
              </div>
            )}

            {importStep === 'done' && (
              <div className="bg-green-50 rounded-2xl px-4 py-3 flex items-center justify-between">
                <p className="text-sm font-medium text-green-700">✅ {importMsg}</p>
                <button onClick={() => setImportStep('idle')} className="text-xs text-green-500 font-medium">Import more</button>
              </div>
            )}

            {importError && (
              <p className="text-sm text-red-500 bg-red-50 rounded-2xl px-4 py-3">❌ {importError}</p>
            )}

            <input ref={fileRef} type="file" accept=".json,application/json"
              onChange={handleFileChange} className="hidden" />
          </div>

          {/* Where CSV goes */}
          <div className="bg-gray-50 rounded-2xl p-4">
            <p className="text-sm font-semibold text-gray-700 mb-1">📂 Where does the file go?</p>
            <p className="text-xs text-gray-500 leading-relaxed">
              <span className="font-medium">iPhone:</span> Files app → Downloads → open in Numbers{'\n\n'}
              <span className="font-medium">Mac:</span> Downloads → open in Numbers / Excel{'\n\n'}
              <span className="font-medium">Android:</span> Downloads → open in Google Sheets
            </p>
          </div>

          {/* Install */}
          <div className="bg-amber-50 rounded-2xl p-4">
            <p className="text-sm font-semibold text-amber-800">📱 Install as App</p>
            <p className="text-xs text-amber-600 mt-1 leading-relaxed">
              iPhone: Safari → Share → "Add to Home Screen"{'\n'}
              Android: Chrome → menu → "Install app"
            </p>
          </div>

          {/* Clear */}
          {!confirmClear ? (
            <button onClick={() => setConfirmClear(true)}
              className="w-full text-red-400 py-3 rounded-2xl text-sm font-medium">
              🗑 Clear all data
            </button>
          ) : (
            <div className="bg-red-50 rounded-2xl p-4 space-y-3">
              <p className="text-sm font-medium text-red-700">Delete all {eventCount} events? Cannot be undone.</p>
              <div className="flex gap-2">
                <button onClick={() => setConfirmClear(false)}
                  className="flex-1 bg-gray-100 py-2.5 rounded-xl text-sm font-medium text-gray-600">Cancel</button>
                <button onClick={handleClear}
                  className="flex-1 bg-red-500 text-white py-2.5 rounded-xl text-sm font-medium">Delete All</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
