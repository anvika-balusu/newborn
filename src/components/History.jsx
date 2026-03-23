import { formatDate, formatTime, getEventIcon, getEventLabel } from '../utils';

const TYPE_GRAD = {
  pee:         'from-sky-400 to-blue-500',
  poop:        'from-amber-400 to-orange-500',
  feed:        'from-rose-400 to-pink-600',
  sleep:       'from-violet-500 to-purple-700',
  hygiene:     'from-teal-400 to-cyan-600',
  diaper_care: 'from-pink-400 to-rose-500',
  dress:       'from-fuchsia-400 to-purple-500',
  pump:        'from-pink-300 to-rose-400',
};

function groupEventsByDate(events) {
  const groups = {};
  events.forEach(event => {
    const key = new Date(event.createdAt).toDateString();
    if (!groups[key]) groups[key] = [];
    groups[key].push(event);
  });
  return Object.entries(groups).map(([dateStr, evts]) => ({
    date: dateStr,
    label: formatDate(evts[0].createdAt),
    events: evts,
  }));
}

function getDetails(event) {
  const d = [];
  if (event.type === 'pump') {
    if (event.side === 'both') {
      if (event.leftMl)  d.push(`L: ${event.leftMl}ml`);
      if (event.rightMl) d.push(`R: ${event.rightMl}ml`);
    } else if (event.quantity) d.push(`${event.quantity}ml`);
    if (event.duration) d.push(`${event.duration}min`);
  }
  if (event.type === 'dress') {
    const lbl = { footie: 'Footie', longsleeve_pants: 'LS+Pants', shortsleeeve_pants: 'SS+Pants', longsleeeve_shorts: 'LS+Shorts', onesie_short: 'Onesie', swaddle: 'Swaddle', just_diaper: 'Diaper only' };
    if (event.dressType) d.push(lbl[event.dressType] || event.dressType);
  }
  if (event.type === 'hygiene') {
    const lbl = { full_bath: 'Full Bath', sponge_bath: 'Sponge Bath', butt_water: 'Butt Wash', wipe: 'Wipe' };
    if (event.washType) d.push(lbl[event.washType] || event.washType);
  }
  if (event.type === 'diaper_care') {
    if (event.rashLevel) d.push(`Rash: ${event.rashLevel}`);
    if (event.ointmentApplied) d.push(event.ointmentName || 'ointment ✓');
  }
  if (event.type === 'poop') {
    if (event.poopColor) d.push(event.poopColor);
    if (event.texture)   d.push(event.texture);
  }
  if (event.type === 'feed') {
    if (event.feedType === 'breast' && event.side) d.push(event.side);
    if (event.quantity) d.push(`${event.quantity}ml`);
    if (event.duration) d.push(`${event.duration}min`);
    if (event.burped === true)  d.push('burped ✓');
    if (event.burped === false) d.push('no burp');
  }
  if (event.type === 'sleep' && event.duration) {
    const h = Math.floor(event.duration / 60), m = event.duration % 60;
    d.push(h > 0 ? `${h}h ${m > 0 ? m + 'm' : ''}` : `${m}m`);
  }
  if (event.notes) d.push(event.notes);
  return d;
}

export default function History({ events, onDelete, onEdit, onAddMissed }) {
  const groups = groupEventsByDate(events);

  return (
    <div className="p-4 space-y-5 pb-8">
      <button onClick={onAddMissed}
        className="w-full py-4 rounded-3xl font-bold text-white text-sm
          bg-gradient-to-r from-violet-600 to-pink-600 shadow-lg active:scale-95 transition-transform flex items-center justify-center gap-2">
        <span className="text-lg">＋</span> Log a Missed Event
      </button>

      {events.length === 0 && (
        <div className="text-center py-16">
          <p className="text-5xl mb-3">📋</p>
          <p className="font-bold text-white/50">No events yet</p>
        </div>
      )}

      {groups.map(group => (
        <section key={group.date}>
          <div className="flex items-center gap-2 mb-2 px-1">
            <p className="text-xs font-bold text-white/50 uppercase tracking-widest">{group.label}</p>
            <span className="text-xs text-white/30">· {group.events.length}</span>
          </div>
          <div className="bg-white rounded-3xl overflow-hidden shadow-xl">
            {group.events.map((event, i) => {
              const grad = TYPE_GRAD[event.type] || 'from-gray-400 to-gray-500';
              const details = getDetails(event);
              return (
                <div key={event.id}
                  className={`flex items-center gap-3 px-4 py-3.5 ${i < group.events.length - 1 ? 'border-b border-gray-50' : ''}`}>
                  <div className={`w-9 h-9 rounded-2xl bg-gradient-to-br ${grad} flex items-center justify-center text-lg shrink-0 shadow-sm`}>
                    {getEventIcon(event.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900">{getEventLabel(event)}</p>
                    {details.length > 0 && (
                      <div className="flex gap-1 mt-0.5 flex-wrap">
                        {details.slice(0, 3).map((d, i) => (
                          <span key={i} className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{d}</span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <span className="text-xs text-gray-400 font-medium tabular-nums mr-1">{formatTime(event.createdAt)}</span>
                    <button onClick={() => onEdit(event)}
                      className="w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center text-sm active:scale-90 transition-transform">
                      ✏️
                    </button>
                    <button onClick={() => { if (window.confirm('Delete?')) onDelete(event.id); }}
                      className="w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center text-sm active:scale-90 transition-transform">
                      🗑
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
