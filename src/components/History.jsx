import { formatDate, formatTime, getEventIcon, getEventLabel } from '../utils';

function groupEventsByDate(events) {
  const groups = {};
  events.forEach(event => {
    const key = new Date(event.createdAt).toDateString();
    if (!groups[key]) groups[key] = [];
    groups[key].push(event);
  });
  return Object.entries(groups).map(([dateStr, events]) => ({
    date: dateStr,
    label: formatDate(events[0].createdAt),
    events,
  }));
}

function EventDetail({ event }) {
  const details = [];
  if (event.type === 'feed') {
    if (event.feedType === 'breast') { if (event.side) details.push(event.side); }
    else if (event.feedType === 'bottled_bm') { details.push('Bottled BM'); if (event.quantity) details.push(`${event.quantity}ml`); }
    else { if (event.quantity) details.push(`${event.quantity}ml`); }
    if (event.duration) details.push(`${event.duration}min`);
    if (event.burped !== undefined) details.push(event.burped ? 'burped ✓' : 'no burp');
  }
  if (event.type === 'pump') {
    if (event.side === 'both') {
      if (event.leftMl) details.push(`L: ${event.leftMl}ml`);
      if (event.rightMl) details.push(`R: ${event.rightMl}ml`);
    } else if (event.quantity) {
      details.push(`${event.quantity}ml`);
    }
    if (event.duration) details.push(`${event.duration}min`);
  }
  if (event.type === 'dress') {
    const labels = { footie: 'Footie', longsleeve_pants: 'Long Sleeve + Pants', shortsleeeve_pants: 'Short Sleeve + Pants', longsleeeve_shorts: 'Long Sleeve + Shorts', onesie_short: 'Onesie', swaddle: 'Swaddle', just_diaper: 'Diaper only' };
    if (event.dressType) details.push(labels[event.dressType] || event.dressType);
  }
  if (event.type === 'hygiene') {
    const labels = { full_bath: 'Full Bath', sponge_bath: 'Sponge Bath', butt_water: 'Butt Wash', wipe: 'Wipe' };
    if (event.washType) details.push(labels[event.washType] || event.washType);
  }
  if (event.type === 'diaper_care') {
    if (event.rashLevel) details.push(`Rash: ${event.rashLevel}`);
    if (event.ointmentApplied) details.push(event.ointmentName || 'ointment applied');
    if (event.ointmentApplied === false) details.push('no ointment');
  }
  if (event.type === 'poop') {
    if (event.poopColor) details.push(event.poopColor);
    if (event.texture) details.push(event.texture);
  }
  if (event.type === 'sleep' && event.duration) {
    const h = Math.floor(event.duration / 60), m = event.duration % 60;
    details.push(h > 0 ? `${h}h ${m > 0 ? m + 'm' : ''}` : `${m}m`);
  }
  if (event.notes) details.push(event.notes);
  return details.length > 0
    ? <p className="text-xs text-gray-400 mt-0.5 truncate">{details.join(' · ')}</p>
    : null;
}

export default function History({ events, onDelete, onEdit, onAddMissed }) {
  const groups = groupEventsByDate(events);

  return (
    <div className="p-4 space-y-5">
      {/* Add missed event button */}
      <button
        onClick={onAddMissed}
        className="w-full flex items-center justify-center gap-2 bg-violet-600 text-white py-3.5 rounded-2xl font-semibold active:scale-95 transition-transform"
      >
        <span className="text-lg">＋</span> Log a Missed Event
      </button>

      {events.length === 0 && (
        <div className="flex flex-col items-center justify-center h-48 text-gray-300">
          <span className="text-5xl mb-3">📋</span>
          <p className="font-semibold text-gray-400">No events yet</p>
          <p className="text-sm mt-1">Start tracking from the Home tab</p>
        </div>
      )}

      {groups.map(group => (
        <section key={group.date}>
          <div className="flex items-center gap-2 mb-2">
            <h2 className="text-sm font-semibold text-violet-700">{group.label}</h2>
            <span className="text-xs text-gray-400">({group.events.length})</span>
          </div>
          <div className="bg-white rounded-2xl shadow-sm divide-y divide-gray-50">
            {group.events.map(event => (
              <div key={event.id} className="flex items-center gap-3 px-4 py-3">
                <span className="text-xl shrink-0">{getEventIcon(event.type)}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800">{getEventLabel(event)}</p>
                  <EventDetail event={event} />
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <span className="text-xs text-gray-400 mr-1">{formatTime(event.createdAt)}</span>
                  <button
                    onClick={() => onEdit(event)}
                    className="w-8 h-8 flex items-center justify-center rounded-xl bg-gray-50 text-gray-400 hover:bg-violet-50 hover:text-violet-500 transition-colors text-sm"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => { if (window.confirm('Delete this entry?')) onDelete(event.id); }}
                    className="w-8 h-8 flex items-center justify-center rounded-xl bg-gray-50 text-gray-400 hover:bg-red-50 hover:text-red-400 transition-colors text-sm"
                  >
                    🗑
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
