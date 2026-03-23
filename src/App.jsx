import { useState, useEffect, useCallback } from 'react';
import Dashboard from './components/Dashboard';
import History from './components/History';
import Analytics from './components/Analytics';
import FeedModal from './components/FeedModal';
import QuickLogModal from './components/QuickLogModal';
import HygieneModal from './components/HygieneModal';
import DiaperCareModal from './components/DiaperCareModal';
import DressModal from './components/DressModal';
import SettingsModal from './components/SettingsModal';
import { getEvents, saveEvent, updateEvent, deleteEvent, getTodayStats } from './store';
import './index.css';

const TABS = [
  { id: 'home',      label: 'Home',     icon: '🏠' },
  { id: 'history',   label: 'History',  icon: '📋' },
  { id: 'analytics', label: 'Insights', icon: '📊' },
];

// Type picker for "add missed event"
function TypePickerModal({ onClose, onSelect }) {
  const types = [
    { type: 'pee',         emoji: '💧', label: 'Pee'         },
    { type: 'poop',        emoji: '💩', label: 'Poop'        },
    { type: 'feed',        emoji: '🍼', label: 'Feed'        },
    { type: 'sleep',       emoji: '😴', label: 'Sleep'       },
    { type: 'hygiene',     emoji: '🛁', label: 'Hygiene'      },
    { type: 'diaper_care', emoji: '🧴', label: 'Diaper Care'  },
    { type: 'dress',       emoji: '👗', label: 'Dress Change' },
  ];
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm"
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-[480px] bg-white rounded-t-3xl shadow-2xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-800">Log a Missed Event</h2>
          <button onClick={onClose} className="text-2xl text-gray-400">✕</button>
        </div>
        <div className="grid grid-cols-2 gap-3 p-5 pb-8">
          {types.map(t => (
            <button key={t.type} onClick={() => onSelect(t.type)}
              className="flex flex-col items-center justify-center gap-2 bg-gray-50 rounded-2xl py-6 active:scale-95 transition-transform">
              <span className="text-4xl">{t.emoji}</span>
              <span className="text-sm font-semibold text-gray-700">{t.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// Simple sleep modal with just time pickers
function SleepMissedModal({ onClose, onSave, event }) {
  const isEdit = !!event;
  const fmt = iso => {
    const d = new Date(iso);
    const pad = n => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };
  const now = new Date().toISOString();
  const [start, setStart] = useState(fmt(event?.createdAt || now));
  const [end, setEnd] = useState(fmt(event?.endTime || now));
  const [notes, setNotes] = useState(event?.notes || '');

  const handleSave = () => {
    const startMs = new Date(start);
    const endMs = new Date(end);
    const duration = Math.max(1, Math.round((endMs - startMs) / 60000));
    onSave({ endTime: endMs.toISOString(), duration, sleeping: false, notes: notes || undefined }, startMs.toISOString());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm"
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-[480px] bg-white rounded-t-3xl shadow-2xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-800">{isEdit ? '✏️ Edit Sleep' : '😴 Log Sleep'}</h2>
          <button onClick={onClose} className="text-2xl text-gray-400">✕</button>
        </div>
        <div className="px-5 py-4 space-y-4 pb-8">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">Sleep started</label>
            <input type="datetime-local" value={start} onChange={e => setStart(e.target.value)}
              max={fmt(now)} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">Woke up</label>
            <input type="datetime-local" value={end} onChange={e => setEnd(e.target.value)}
              max={fmt(now)} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">Notes</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="e.g. nap, restless..."
              rows={2} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm resize-none" />
          </div>
          <button onClick={handleSave}
            className="w-full bg-violet-600 text-white py-3.5 rounded-2xl font-semibold active:scale-95 transition-transform">
            {isEdit ? 'Save Changes' : 'Save Sleep'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [tab, setTab] = useState('home');
  const [events, setEvents] = useState([]);
  const [stats, setStats] = useState({ pee: 0, poop: 0, feeds: 0, sleepMinutes: 0 });
  const [modal, setModal] = useState(null); // 'feed'|'poop'|'pee'|'sleep'|'settings'|'typepicker'
  const [editingEvent, setEditingEvent] = useState(null);
  const [activeSleep, setActiveSleep] = useState(null);
  const [tick, setTick] = useState(0);

  const refresh = useCallback(() => {
    const all = getEvents();
    setEvents(all);
    setStats(getTodayStats());
    setActiveSleep(all.find(e => e.type === 'sleep' && e.sleeping) || null);
  }, []);

  useEffect(() => { refresh(); }, [refresh]);
  useEffect(() => {
    const t = setInterval(() => setTick(n => n + 1), 1000);
    return () => clearInterval(t);
  }, []);

  const closeModal = () => { setModal(null); setEditingEvent(null); };

  const handleQuickPee = () => { saveEvent({ type: 'pee' }); refresh(); };

  const handleSleepToggle = () => {
    if (activeSleep) {
      const duration = Math.max(1, Math.round((Date.now() - new Date(activeSleep.createdAt)) / 60000));
      updateEvent(activeSleep.id, { sleeping: false, duration, endTime: new Date().toISOString() });
    } else {
      saveEvent({ type: 'sleep', sleeping: true });
    }
    refresh();
  };

  // Generic save: either create new or update existing
  const handleSave = (type, data, customTime) => {
    if (editingEvent) {
      updateEvent(editingEvent.id, { ...data, createdAt: customTime || editingEvent.createdAt });
    } else {
      saveEvent({ type, ...data }, customTime);
    }
    closeModal();
    refresh();
  };

  const handleEdit = (event) => {
    setEditingEvent(event);
    setModal(event.type === 'sleep' ? 'sleep' : event.type);
  };

  const handleAddMissed = (type) => {
    setEditingEvent(null);
    setModal(type);
  };

  const handleDelete = (id) => { deleteEvent(id); refresh(); };

  const dateStr = new Date().toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' });

  // Avika born Feb 27, 2026 6:37 PM CST (UTC-6)
  const BIRTH = new Date('2026-02-27T18:37:00-06:00');
  const ageMs = Date.now() - BIRTH.getTime();
  const ageDays = Math.floor(ageMs / 86400000);
  const ageWeeks = Math.floor(ageDays / 7);
  const ageRemDays = ageDays % 7;
  const ageStr = ageWeeks > 0
    ? `${ageWeeks}w ${ageRemDays > 0 ? ageRemDays + 'd' : ''} old`
    : `${ageDays}d old`;

  return (
    <div className="flex flex-col min-h-svh" style={{ background: '#f8f4ff' }}>
      <header className="sticky top-0 z-10 px-5 pt-4 pb-3 flex items-center justify-between"
        style={{ background: 'rgba(248,244,255,0.92)', backdropFilter: 'blur(12px)' }}>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">👶</span>
            <h1 className="text-xl font-black text-gray-900 tracking-tight">Avika</h1>
          </div>
          <p className="text-xs text-gray-400 mt-0.5 ml-8">{ageStr} · {dateStr}</p>
        </div>
        <button onClick={() => setModal('settings')}
          className="w-10 h-10 rounded-2xl bg-white shadow-sm flex items-center justify-center text-lg active:scale-95 transition-transform border border-gray-100">
          ⚙️
        </button>
      </header>

      <main className="flex-1 overflow-y-auto pb-24">
        {tab === 'home' && (
          <Dashboard
            stats={stats} events={events} activeSleep={activeSleep} tick={tick}
            onPee={handleQuickPee}
            onPoop={() => { setEditingEvent(null); setModal('poop'); }}
            onFeed={() => { setEditingEvent(null); setModal('feed'); }}
            onSleepToggle={handleSleepToggle}
            onHygiene={() => { setEditingEvent(null); setModal('hygiene'); }}
            onDiaperCare={() => { setEditingEvent(null); setModal('diaper_care'); }}
            onDress={() => { setEditingEvent(null); setModal('dress'); }}
          />
        )}
        {tab === 'history' && (
          <History
            events={events}
            onDelete={handleDelete}
            onEdit={handleEdit}
            onAddMissed={() => setModal('typepicker')}
          />
        )}
        {tab === 'analytics' && <Analytics events={events} />}
      </main>

      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] z-10"
        style={{ background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(12px)', borderTop: '1px solid #f0eaff' }}>
        <div className="flex">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex-1 py-3.5 flex flex-col items-center gap-0.5 text-xs font-semibold transition-colors
                ${tab === t.id ? 'text-violet-700' : 'text-gray-400'}`}>
              <span className="text-xl leading-none">{t.icon}</span>
              <span>{t.label}</span>
            </button>
          ))}
        </div>
        <div style={{ height: 'env(safe-area-inset-bottom, 0px)' }} />
      </nav>

      {modal === 'feed' && (
        <FeedModal event={editingEvent} onClose={closeModal}
          onSave={(data, time) => handleSave('feed', data, time)} />
      )}
      {modal === 'poop' && (
        <QuickLogModal title="Poop 💩" type="poop" event={editingEvent} onClose={closeModal}
          onSave={(data, time) => handleSave('poop', data, time)} />
      )}
      {modal === 'pee' && (
        <QuickLogModal title="Pee 💧" type="pee" event={editingEvent} onClose={closeModal}
          onSave={(data, time) => handleSave('pee', data, time)} />
      )}
      {modal === 'sleep' && (
        <SleepMissedModal event={editingEvent} onClose={closeModal}
          onSave={(data, time) => handleSave('sleep', data, time)} />
      )}
      {modal === 'dress' && (
        <DressModal event={editingEvent} onClose={closeModal}
          onSave={(data, time) => handleSave('dress', data, time)} />
      )}
      {modal === 'hygiene' && (
        <HygieneModal event={editingEvent} onClose={closeModal}
          onSave={(data, time) => handleSave('hygiene', data, time)} />
      )}
      {modal === 'diaper_care' && (
        <DiaperCareModal event={editingEvent} onClose={closeModal}
          onSave={(data, time) => handleSave('diaper_care', data, time)} />
      )}
      {modal === 'typepicker' && (
        <TypePickerModal onClose={closeModal}
          onSelect={type => { setModal(type); }} />
      )}
      {modal === 'settings' && <SettingsModal onClose={closeModal} onRefresh={refresh} />}
    </div>
  );
}
