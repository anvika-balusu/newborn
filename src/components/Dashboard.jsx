import { formatElapsed, timeSince, getEventLabel } from '../utils';

const TYPE_CONFIG = {
  pee:         { emoji: '💧', label: 'Pee',          bg: 'bg-sky-50',    border: 'border-sky-200',    pill: 'bg-sky-500',    text: 'text-sky-700'    },
  poop:        { emoji: '💩', label: 'Poop',         bg: 'bg-amber-50',  border: 'border-amber-200',  pill: 'bg-amber-500',  text: 'text-amber-700'  },
  feed:        { emoji: '🍼', label: 'Feed',         bg: 'bg-rose-50',   border: 'border-rose-200',   pill: 'bg-rose-500',   text: 'text-rose-700'   },
  sleep:       { emoji: '😴', label: 'Sleep',        bg: 'bg-violet-50', border: 'border-violet-200', pill: 'bg-violet-500', text: 'text-violet-700' },
  hygiene:     { emoji: '🛁', label: 'Hygiene',      bg: 'bg-teal-50',   border: 'border-teal-200',   pill: 'bg-teal-500',   text: 'text-teal-700'   },
  diaper_care: { emoji: '🧴', label: 'Diaper Care',  bg: 'bg-pink-50',   border: 'border-pink-200',   pill: 'bg-pink-500',   text: 'text-pink-700'   },
  dress:       { emoji: '👗', label: 'Dress Change', bg: 'bg-fuchsia-50',border: 'border-fuchsia-200',pill: 'bg-fuchsia-500',text: 'text-fuchsia-700'},
};

function ActionButton({ type, label, sublabel, onClick, active }) {
  const c = TYPE_CONFIG[type];
  return (
    <button onClick={onClick}
      className={`relative flex flex-col items-center justify-center gap-2 rounded-3xl border-2
        active:scale-95 transition-all duration-100 select-none
        ${c.bg} ${active ? c.border + ' shadow-lg' : 'border-transparent shadow-sm'}`}
      style={{ minHeight: 110 }}>
      {active && <span className={`absolute top-2 right-2 w-2.5 h-2.5 rounded-full ${c.pill} animate-pulse`} />}
      <span className="text-5xl leading-none">{c.emoji}</span>
      <div className="text-center px-1">
        <p className={`text-sm font-bold ${c.text}`}>{label}</p>
        {sublabel && <p className="text-xs text-gray-400 mt-0.5 leading-tight">{sublabel}</p>}
      </div>
    </button>
  );
}

function SmallButton({ type, label, onClick }) {
  const c = TYPE_CONFIG[type];
  return (
    <button onClick={onClick}
      className={`flex items-center justify-center gap-2 rounded-2xl border border-transparent
        ${c.bg} active:scale-95 transition-all duration-100 px-4 py-3`}>
      <span className="text-2xl">{c.emoji}</span>
      <span className={`text-sm font-bold ${c.text}`}>{label}</span>
    </button>
  );
}

function StatPill({ type, value, last }) {
  const c = TYPE_CONFIG[type];
  return (
    <div className={`flex items-center gap-3 ${c.bg} rounded-2xl px-4 py-3 border ${c.border}`}>
      <div className={`w-10 h-10 rounded-xl ${c.pill} flex items-center justify-center text-xl shrink-0`}>
        {c.emoji}
      </div>
      <div className="min-w-0">
        <div className="flex items-baseline gap-1.5">
          <span className={`text-2xl font-black ${c.text}`}>{value}</span>
          <span className="text-xs text-gray-400 font-medium">today</span>
        </div>
        <p className="text-xs text-gray-400 truncate">{last ? `Last ${timeSince(last.createdAt)}` : 'None yet'}</p>
      </div>
    </div>
  );
}

function RecentItem({ event }) {
  const c = TYPE_CONFIG[event.type] || TYPE_CONFIG.feed;
  const time = new Date(event.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const details = [];
  if (event.burped === true) details.push('burped ✓');
  if (event.burped === false) details.push('no burp');
  if (event.poopColor) details.push(event.poopColor);
  if (event.texture) details.push(event.texture);
  if (event.washType) details.push({ full_bath: 'Full Bath', sponge_bath: 'Sponge', butt_water: 'Butt Wash', wipe: 'Wipe' }[event.washType] || event.washType);
  if (event.dressType) details.push({ footie: 'Footie', longsleeve_pants: 'LS+Pants', shortsleeeve_pants: 'SS+Pants', longsleeeve_shorts: 'LS+Shorts', onesie_short: 'Onesie', swaddle: 'Swaddle', just_diaper: 'Diaper only' }[event.dressType] || event.dressType);
  if (event.rashLevel && event.rashLevel !== 'none') details.push(`rash: ${event.rashLevel}`);
  if (event.ointmentApplied) details.push(event.ointmentName || 'ointment ✓');
  if (event.notes) details.push(event.notes);

  return (
    <div className="flex items-center gap-3 py-3 px-4">
      <span className="text-xl shrink-0">{c.emoji}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-800 truncate">{getEventLabel(event)}</p>
        {details.length > 0 && <p className="text-xs text-gray-400 truncate">{details.join(' · ')}</p>}
      </div>
      <span className="text-xs text-gray-400 shrink-0 font-medium">{time}</span>
    </div>
  );
}

export default function Dashboard({ stats, events, activeSleep, tick, onPee, onPoop, onFeed, onSleepToggle, onHygiene, onDiaperCare, onDress }) {
  const todayEvents = events.filter(e => new Date(e.createdAt).toDateString() === new Date().toDateString());
  const lastOf = (type) => events.find(e => e.type === type);

  const sleepDisplay = stats.sleepMinutes > 0
    ? (Math.floor(stats.sleepMinutes / 60) > 0
        ? `${Math.floor(stats.sleepMinutes / 60)}h ${stats.sleepMinutes % 60 > 0 ? stats.sleepMinutes % 60 + 'm' : ''}`
        : `${stats.sleepMinutes}m`)
    : '0';

  const sleepSublabel = activeSleep ? `Sleeping · ${formatElapsed(activeSleep.createdAt)}` : 'Tap to start';

  return (
    <div className="px-4 pt-4 pb-6 space-y-6">

      {/* Stats */}
      <div className="grid grid-cols-2 gap-2.5">
        <StatPill type="pee"  value={stats.pee}   last={lastOf('pee')} />
        <StatPill type="poop" value={stats.poop}  last={lastOf('poop')} />
        <StatPill type="feed" value={stats.feeds} last={lastOf('feed')} />
        <div className="flex items-center gap-3 bg-violet-50 rounded-2xl px-4 py-3 border border-violet-200">
          <div className="w-10 h-10 rounded-xl bg-violet-500 flex items-center justify-center text-xl shrink-0">😴</div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-violet-700">{sleepDisplay}</span>
              <span className="text-xs text-gray-400 font-medium">today</span>
            </div>
            <p className="text-xs text-gray-400">
              {activeSleep
                ? `Since ${new Date(activeSleep.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                : 'No active sleep'}
            </p>
          </div>
        </div>
      </div>

      {/* Main quick log buttons */}
      <div>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Quick Log</p>
        <div className="grid grid-cols-2 gap-3">
          <ActionButton type="pee"  label="Pee"  sublabel="Tap to log" onClick={onPee} />
          <ActionButton type="poop" label="Poop" sublabel="Tap for details" onClick={onPoop} />
          <ActionButton type="feed" label="Feed" sublabel="Breast / Bottled / Formula" onClick={onFeed} />
          <ActionButton type="sleep"
            label={activeSleep ? 'Stop Sleep' : 'Sleep'}
            sublabel={sleepSublabel}
            onClick={onSleepToggle}
            active={!!activeSleep} />
        </div>
      </div>

      {/* Secondary care buttons */}
      <div>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Care</p>
        <div className="grid grid-cols-3 gap-2">
          <SmallButton type="hygiene"     label="Hygiene"     onClick={onHygiene} />
          <SmallButton type="diaper_care" label="Diaper Care" onClick={onDiaperCare} />
          <SmallButton type="dress"       label="Dress"       onClick={onDress} />
        </div>
      </div>

      {/* Recent */}
      {todayEvents.length > 0 && (
        <div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Today's Activity</p>
          <div className="bg-white rounded-3xl shadow-sm overflow-hidden divide-y divide-gray-50">
            {todayEvents.slice(0, 10).map(event => <RecentItem key={event.id} event={event} />)}
          </div>
        </div>
      )}

      {todayEvents.length === 0 && (
        <div className="text-center py-10">
          <p className="text-5xl mb-3">👶</p>
          <p className="font-semibold text-gray-400">Nothing logged today yet</p>
          <p className="text-sm text-gray-300 mt-1">Tap the buttons above to start tracking</p>
        </div>
      )}
    </div>
  );
}
