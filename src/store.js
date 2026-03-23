// LocalStorage-based data store for baby events

const EVENTS_KEY = 'avika_events';
const SETTINGS_KEY = 'avika_settings';

export function getEvents() {
  try {
    return JSON.parse(localStorage.getItem(EVENTS_KEY) || '[]');
  } catch {
    return [];
  }
}

function generateId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 9);
}

export function saveEvent(event, customTime) {
  const events = getEvents();
  const newEvent = {
    ...event,
    id: generateId(),
    createdAt: customTime || new Date().toISOString(),
  };
  events.push(newEvent);
  events.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  localStorage.setItem(EVENTS_KEY, JSON.stringify(events));
  return newEvent;
}

export function updateEvent(id, updates) {
  const events = getEvents();
  const idx = events.findIndex(e => e.id === id);
  if (idx !== -1) {
    events[idx] = { ...events[idx], ...updates };
    localStorage.setItem(EVENTS_KEY, JSON.stringify(events));
    return events[idx];
  }
  return null;
}

export function deleteEvent(id) {
  const events = getEvents().filter(e => e.id !== id);
  localStorage.setItem(EVENTS_KEY, JSON.stringify(events));
}

export function getSettings() {
  try {
    return JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}');
  } catch {
    return {};
  }
}

export function saveSettings(settings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

function download(content, filename, mime) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function importJSON(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        const incoming = Array.isArray(data) ? data : (data.events || []);
        if (!incoming.length) { reject(new Error('No events found in file')); return; }
        const existing = getEvents();
        const existingIds = new Set(existing.map(e => e.id));
        const merged = [...existing, ...incoming.filter(e => !existingIds.has(e.id))];
        merged.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        localStorage.setItem(EVENTS_KEY, JSON.stringify(merged));
        resolve(incoming.length);
      } catch {
        reject(new Error('Invalid JSON file'));
      }
    };
    reader.onerror = () => reject(new Error('Could not read file'));
    reader.readAsText(file);
  });
}

export function exportCSV() {
  const events = getEvents();
  const rows = [
    ['Date', 'Time', 'Type', 'Feed Type', 'Side', 'Quantity (ml)', 'Duration (min)', 'Burped',
     'Poop Color', 'Texture', 'Sleep Duration (min)', 'Wash Type', 'Rash Level', 'Ointment', 'Ointment Name', 'Notes'],
  ];
  for (const e of [...events].reverse()) {
    const d = new Date(e.createdAt);
    rows.push([
      d.toLocaleDateString(),
      d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      e.type,
      e.feedType ?? '',
      e.side ?? '',
      e.quantity ?? '',
      e.type !== 'sleep' ? (e.duration ?? '') : '',
      e.burped === true ? 'Yes' : e.burped === false ? 'No' : '',
      e.poopColor ?? '',
      e.texture ?? '',
      e.type === 'sleep' ? (e.duration ?? '') : '',
      e.washType ?? '',
      e.rashLevel ?? '',
      e.ointmentApplied === true ? 'Yes' : e.ointmentApplied === false ? 'No' : '',
      e.ointmentName ?? '',
      e.notes ?? '',
    ]);
  }
  const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
  download(csv, `avika-${new Date().toISOString().split('T')[0]}.csv`, 'text/csv');
}

export function exportJSON() {
  const data = { exportedAt: new Date().toISOString(), events: getEvents() };
  download(JSON.stringify(data, null, 2), `avika-${new Date().toISOString().split('T')[0]}.json`, 'application/json');
}

export function getEventsForDate(date) {
  const events = getEvents();
  const dateStr = date.toDateString();
  return events.filter(e => new Date(e.createdAt).toDateString() === dateStr);
}

export function getTodayStats() {
  const today = getEventsForDate(new Date());
  return {
    pee: today.filter(e => e.type === 'pee').length,
    poop: today.filter(e => e.type === 'poop').length,
    feeds: today.filter(e => e.type === 'feed').length,
    sleepMinutes: today
      .filter(e => e.type === 'sleep' && e.duration)
      .reduce((sum, e) => sum + (e.duration || 0), 0),
  };
}
