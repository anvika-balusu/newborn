import { useState, useRef } from 'react';
import { exportCSV, exportJSON, importJSON, getEvents } from '../store';

export default function SettingsModal({ onClose, onRefresh }) {
  const [confirmClear, setConfirmClear] = useState(false);
  const [importStatus, setImportStatus] = useState(null); // null | 'success' | 'error'
  const [importMsg, setImportMsg] = useState('');
  const fileRef = useRef();
  const eventCount = getEvents().length;

  const handleImport = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const count = await importJSON(file);
      setImportMsg(`Imported ${count} events`);
      setImportStatus('success');
      onRefresh();
    } catch (err) {
      setImportMsg(err.message);
      setImportStatus('error');
    }
    e.target.value = '';
  };

  const handleClear = () => {
    localStorage.removeItem('avika_events');
    onRefresh();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm"
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-[480px] bg-white rounded-t-3xl shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-800">⚙️ Settings</h2>
          <button onClick={onClose} className="text-2xl text-gray-400">✕</button>
        </div>

        <div className="px-5 py-4 space-y-3 pb-8">
          {/* Stats */}
          <div className="bg-violet-50 rounded-2xl p-4">
            <p className="text-xs font-semibold text-violet-400 uppercase tracking-wide">Total logged</p>
            <p className="text-4xl font-black text-violet-700">{eventCount} <span className="text-base font-medium text-violet-400">events</span></p>
          </div>

          {/* Export */}
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest pt-1">Export Data</p>

          <button onClick={exportCSV}
            className="w-full flex items-center gap-3 bg-emerald-50 border border-emerald-100 px-4 py-4 rounded-2xl active:scale-95 transition-transform text-left">
            <span className="text-2xl">📊</span>
            <div>
              <p className="font-semibold text-emerald-800 text-sm">Download CSV</p>
              <p className="text-xs text-emerald-500">Open in Numbers, Excel, or Google Sheets</p>
            </div>
          </button>

          <button onClick={exportJSON}
            className="w-full flex items-center gap-3 bg-blue-50 border border-blue-100 px-4 py-4 rounded-2xl active:scale-95 transition-transform text-left">
            <span className="text-2xl">💾</span>
            <div>
              <p className="font-semibold text-blue-800 text-sm">Download JSON Backup</p>
              <p className="text-xs text-blue-500">Full backup — use to restore data</p>
            </div>
          </button>

          {/* Import */}
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest pt-1">Import Data</p>

          <button onClick={() => fileRef.current?.click()}
            className="w-full flex items-center gap-3 bg-amber-50 border border-amber-100 px-4 py-4 rounded-2xl active:scale-95 transition-transform text-left">
            <span className="text-2xl">📥</span>
            <div>
              <p className="font-semibold text-amber-800 text-sm">Restore from JSON Backup</p>
              <p className="text-xs text-amber-500">Merges backup into current data (no duplicates)</p>
            </div>
          </button>
          <input ref={fileRef} type="file" accept=".json,application/json"
            onChange={handleImport} className="hidden" />

          {importStatus && (
            <div className={`rounded-2xl px-4 py-3 text-sm font-medium
              ${importStatus === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
              {importStatus === 'success' ? '✅' : '❌'} {importMsg}
            </div>
          )}

          {/* Where does it go */}
          <div className="bg-gray-50 rounded-2xl p-4">
            <p className="text-sm font-semibold text-gray-700 mb-1">📂 Where does the CSV go?</p>
            <p className="text-xs text-gray-500 leading-relaxed">
              <span className="font-medium">iPhone/iPad:</span> Files app → Downloads → tap to open in Numbers{'\n\n'}
              <span className="font-medium">Mac:</span> Downloads folder → open in Numbers / Excel{'\n\n'}
              <span className="font-medium">Android:</span> Downloads folder → open in Google Sheets
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
