import { formatElapsed, timeSince, getEventLabel } from '../utils';

const TYPE = {
  pee:         { emoji: '💧', label: 'Pee',         grad: 'from-sky-400 to-blue-500'       },
  poop:        { emoji: '💩', label: 'Poop',        grad: 'from-amber-400 to-orange-500'   },
  feed:        { emoji: '🍼', label: 'Feed',        grad: 'from-rose-400 to-pink-600'      },
  sleep:       { emoji: '😴', label: 'Sleep',       grad: 'from-violet-500 to-purple-700'  },
  hygiene:     { emoji: '🛁', label: 'Hygiene',     grad: 'from-teal-400 to-cyan-600'      },
  diaper_care: { emoji: '🧴', label: 'Diaper Care', grad: 'from-pink-400 to-rose-500'      },
  dress:       { emoji: '👗', label: 'Dress',       grad: 'from-fuchsia-400 to-purple-500' },
  pump:        { emoji: '🍼', label: 'Mom Pump',    grad: 'from-pink-300 to-rose-400'      },
};

function BigActionBtn({ type, label, sublabel, onClick, active }) {
  const t = TYPE[type];
  return (
    <button onClick={onClick}
      className={`relative flex flex-col items-center justify-center gap-2 rounded-3xl p-5
        bg-gradient-to-br ${t.grad} shadow-lg
        active:scale-95 transition-all duration-150 select-none overflow-hidden`}
      style={{ minHeight: 130 }}>
      {/* Shine overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent pointer-events-none rounded-3xl" />
      {active && (
        <span className="absolute top-3 right-3 w-2.5 h-2.5 rounded-full bg-white animate-pulse" />
      )}
      <span className="text-5xl leading-none drop-shadow-sm">{t.emoji}</span>
      <div className="text-center z-10">
        <p className="text-sm font-bold text-white drop-shadow">{label}</p>
        {sublabel && <p className="text-xs text-white/70 mt-0.5 leading-tight px-1">{sublabel}</p>}
      </div>
    </button>
  );
}

function CareBtn({ type, onClick }) {
  const t = TYPE[type];
  return (
    <button onClick={onClick}
      className={`flex flex-col items-center gap-1.5 py-3.5 rounded-2xl
        bg-white/8 border border-white/10 active:scale-95 transition-all duration-150 select-none`}>
      <span className="text-2xl">{t.emoji}</span>
      <span className="text-xs font-semibold text-white/70">{t.label}</span>
    </button>
  );
}

function StatCard({ type, value, lastEvent }) {
  const t = TYPE[type];
  return (
    <div className={`rounded-2xl p-4 bg-gradient-to-br ${t.grad} relative overflow-hidden`}>
      <div className="absolute inset-0 bg-gradient-to-b from-white/15 to-transparent pointer-events-none" />
      <p className="text-3xl font-black text-white">{value}</p>
      <p className="text-xs text-white/80 font-medium mt-0.5">{t.label}</p>
      <p className="text-xs text-white/60 mt-1">{lastEvent ? timeSince(lastEvent.createdAt) : '—'}</p>
    </div>
  );
}

function RecentRow({ event }) {
  const t = TYPE[event.type] || TYPE.feed;
  const time = new Date(event.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const label = getEventLabel(event);

  const tags = [];
  if (event.burped === true)  tags.push('burped ✓');
  if (event.burped === false) tags.push('no burp');
  if (event.poopColor)        tags.push(event.poopColor);
  if (event.texture)          tags.push(event.texture);
  if (event.side && event.type === 'feed') tags.push(event.side);
  if (event.quantity)         tags.push(`${event.quantity}ml`);
  if (event.washType)         tags.push({ full_bath: 'Full Bath', sponge_bath: 'Sponge', butt_water: 'Butt Wash', wipe: 'Wipe' }[event.washType] || event.washType);
  if (event.rashLevel && event.rashLevel !== 'none') tags.push(`rash: ${event.rashLevel}`);
  if (event.notes)            tags.push(event.notes);

  return (
    <div className="flex items-center gap-3 py-3 px-4">
      <div className={`w-9 h-9 rounded-2xl bg-gradient-to-br ${t.grad} flex items-center justify-center text-lg shrink-0 shadow-sm`}>
        {t.emoji}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900 truncate">{label}</p>
        {tags.length > 0 && (
          <div className="flex gap-1 mt-0.5 flex-wrap">
            {tags.slice(0, 3).map((tag, i) => (
              <span key={i} className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{tag}</span>
            ))}
          </div>
        )}
      </div>
      <span className="text-xs text-gray-400 shrink-0 font-medium tabular-nums">{time}</span>
    </div>
  );
}

export default function Dashboard({ stats, events, activeSleep, tick, onPee, onPoop, onFeed, onSleepToggle, onHygiene, onDiaperCare, onDress, onPump }) {
  const todayEvents = events.filter(e => new Date(e.createdAt).toDateString() === new Date().toDateString());
  const lastOf = type => events.find(e => e.type === type);

  const sleepDisplay = stats.sleepMinutes > 0
    ? (Math.floor(stats.sleepMinutes / 60) > 0
        ? `${Math.floor(stats.sleepMinutes / 60)}h${stats.sleepMinutes % 60 > 0 ? stats.sleepMinutes % 60 + 'm' : ''}`
        : `${stats.sleepMinutes}m`)
    : '0';

  const sleepSub = activeSleep ? formatElapsed(activeSleep.createdAt) : 'tap to start';

  return (
    <div className="pb-8">

      {/* Stats strip */}
      <div className="px-4 pt-4 grid grid-cols-4 gap-2">
        <StatCard type="pee"   value={stats.pee}   lastEvent={lastOf('pee')}  />
        <StatCard type="poop"  value={stats.poop}  lastEvent={lastOf('poop')} />
        <StatCard type="feed"  value={stats.feeds} lastEvent={lastOf('feed')} />
        <div className={`rounded-2xl p-4 bg-gradient-to-br from-violet-500 to-purple-700 relative overflow-hidden`}>
          <div className="absolute inset-0 bg-gradient-to-b from-white/15 to-transparent pointer-events-none" />
          <p className="text-2xl font-black text-white leading-tight">{sleepDisplay}</p>
          <p className="text-xs text-white/80 font-medium mt-0.5">Sleep</p>
          {activeSleep && <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
        </div>
      </div>

      {/* Main action buttons */}
      <div className="px-4 mt-5">
        <p className="text-xs font-bold text-white/40 uppercase tracking-widest mb-3">Quick Log</p>
        <div className="grid grid-cols-2 gap-3">
          <BigActionBtn type="pee"   label="Pee"   sublabel="Tap to log instantly"      onClick={onPee} />
          <BigActionBtn type="poop"  label="Poop"  sublabel="Tap to add details"        onClick={onPoop} />
          <BigActionBtn type="feed"  label="Feed"  sublabel="Breast · Bottled · Formula" onClick={onFeed} />
          <BigActionBtn type="sleep"
            label={activeSleep ? 'Stop Sleep' : 'Sleep'}
            sublabel={sleepSub}
            onClick={onSleepToggle}
            active={!!activeSleep} />
        </div>
      </div>

      {/* Care strip */}
      <div className="px-4 mt-5">
        <p className="text-xs font-bold text-white/40 uppercase tracking-widest mb-3">Care</p>
        <div className="grid grid-cols-4 gap-2">
          <CareBtn type="hygiene"     onClick={onHygiene} />
          <CareBtn type="diaper_care" onClick={onDiaperCare} />
          <CareBtn type="dress"       onClick={onDress} />
          <CareBtn type="pump"        onClick={onPump} />
        </div>
      </div>

      {/* Recent activity */}
      {todayEvents.length > 0 && (
        <div className="px-4 mt-5">
          <p className="text-xs font-bold text-white/40 uppercase tracking-widest mb-3">Today</p>
          <div className="bg-white rounded-3xl overflow-hidden shadow-xl">
            {todayEvents.slice(0, 10).map(event => (
              <div key={event.id} className="border-b border-gray-50 last:border-0">
                <RecentRow event={event} />
              </div>
            ))}
          </div>
        </div>
      )}

      {todayEvents.length === 0 && (
        <div className="text-center py-16">
          <p className="text-6xl mb-4">👶</p>
          <p className="font-bold text-white/60">Nothing logged today</p>
          <p className="text-sm text-white/30 mt-1">Tap the buttons above</p>
        </div>
      )}
    </div>
  );
}
