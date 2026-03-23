import { useMemo } from 'react';

function avg(arr) { return arr.length ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : null; }

function minutesToHm(m) {
  if (!m) return '—';
  const h = Math.floor(m / 60), min = m % 60;
  return h > 0 ? `${h}h ${min > 0 ? min + 'm' : ''}` : `${min}m`;
}

function formatHour(h) {
  if (h === 0) return '12a';
  if (h < 12) return `${h}a`;
  if (h === 12) return '12p';
  return `${h - 12}p`;
}

// Get last N days of dates
function lastNDays(n) {
  return Array.from({ length: n }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (n - 1 - i));
    return d;
  });
}

function DailyBar({ label, value, max, color }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-xs font-bold text-gray-700">{value > 0 ? value : ''}</span>
      <div className="w-8 bg-gray-100 rounded-full overflow-hidden" style={{ height: 60 }}>
        <div className={`w-full rounded-full transition-all ${color}`} style={{ height: `${pct}%`, marginTop: `${100 - pct}%` }} />
      </div>
      <span className="text-xs text-gray-400">{label}</span>
    </div>
  );
}

function StatBox({ label, value, sub, color }) {
  return (
    <div className={`rounded-2xl p-4 ${color}`}>
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</p>
      <p className="text-3xl font-black text-gray-800 mt-1">{value ?? '—'}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  );
}

export default function Analytics({ events }) {
  const days7 = lastNDays(7);

  const byDate = useMemo(() => {
    const map = {};
    days7.forEach(d => {
      const key = d.toDateString();
      map[key] = { pee: 0, poop: 0, feeds: 0, sleepMin: 0 };
    });
    events.forEach(e => {
      const key = new Date(e.createdAt).toDateString();
      if (!map[key]) return;
      if (e.type === 'pee') map[key].pee++;
      if (e.type === 'poop') map[key].poop++;
      if (e.type === 'feed') map[key].feeds++;
      if (e.type === 'sleep' && e.duration) map[key].sleepMin += e.duration;
    });
    return days7.map(d => ({ label: d.toLocaleDateString([], { weekday: 'short' }), ...map[d.toDateString()] }));
  }, [events]);

  const feedEvents = events.filter(e => e.type === 'feed');
  const breastFeeds = feedEvents.filter(e => e.feedType === 'breast' && e.duration);
  const formulaFeeds = feedEvents.filter(e => e.feedType === 'formula' && e.quantity);
  const bottledFeeds = feedEvents.filter(e => e.feedType === 'bottled_bm' && e.quantity);

  const avgBreastDuration = avg(breastFeeds.map(e => e.duration));
  const avgFormulaMl = avg(formulaFeeds.map(e => e.quantity));
  const avgBottledMl = avg(bottledFeeds.map(e => e.quantity));
  const burpRate = feedEvents.length
    ? Math.round((feedEvents.filter(e => e.burped).length / feedEvents.length) * 100)
    : null;

  // Feed intervals (time between feeds)
  const feedTimes = [...feedEvents].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  const intervals = [];
  for (let i = 1; i < feedTimes.length; i++) {
    const diff = (new Date(feedTimes[i].createdAt) - new Date(feedTimes[i - 1].createdAt)) / 60000;
    if (diff < 360) intervals.push(diff); // ignore gaps > 6h (likely overnight)
  }
  const avgInterval = avg(intervals.map(Math.round));

  // Sleep stats (last 7 days)
  const sleepEvents = events.filter(e => e.type === 'sleep' && e.duration);
  const avgSleepPerDay = avg(byDate.map(d => d.sleepMin).filter(m => m > 0));

  // Poop color breakdown (last 7 days recent events)
  const recentPoops = events.filter(e => e.type === 'poop' && e.poopColor).slice(0, 20);
  const colorCounts = {};
  recentPoops.forEach(e => { colorCounts[e.poopColor] = (colorCounts[e.poopColor] || 0) + 1; });

  // Feed hour heatmap
  const feedHours = Array(24).fill(0);
  feedEvents.slice(0, 60).forEach(e => { feedHours[new Date(e.createdAt).getHours()]++; });
  const maxFeedHour = Math.max(...feedHours);

  const maxPee = Math.max(...byDate.map(d => d.pee), 1);
  const maxPoop = Math.max(...byDate.map(d => d.poop), 1);
  const maxFeed = Math.max(...byDate.map(d => d.feeds), 1);

  return (
    <div className="p-4 space-y-6 pb-8">

      {/* 7-day overview */}
      <div>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Last 7 Days</p>
        <div className="bg-white rounded-3xl p-4 shadow-sm">
          <div className="flex justify-around items-end">
            {byDate.map((d, i) => (
              <div key={i} className="flex flex-col items-center gap-3">
                <DailyBar label="" value={d.pee}   max={maxPee}  color="bg-sky-400" />
                <DailyBar label="" value={d.poop}  max={maxPoop} color="bg-amber-400" />
                <DailyBar label="" value={d.feeds} max={maxFeed} color="bg-rose-400" />
                <span className="text-xs text-gray-400 font-medium">{d.label}</span>
              </div>
            ))}
          </div>
          <div className="flex gap-4 justify-center mt-3 text-xs text-gray-400">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-sky-400 inline-block" />Pee</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />Poop</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-rose-400 inline-block" />Feed</span>
          </div>
        </div>
      </div>

      {/* Feed stats */}
      <div>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Feeding</p>
        <div className="grid grid-cols-2 gap-2.5">
          <StatBox label="Avg feed interval" value={avgInterval ? `${avgInterval}m` : '—'} sub="between feeds" color="bg-rose-50" />
          <StatBox label="Burp rate" value={burpRate !== null ? `${burpRate}%` : '—'} sub="of feeds" color="bg-violet-50" />
          {avgBreastDuration && <StatBox label="Avg breast time" value={`${avgBreastDuration}m`} sub="per session" color="bg-pink-50" />}
          {avgFormulaMl && <StatBox label="Avg formula" value={`${avgFormulaMl}ml`} sub="per feed" color="bg-blue-50" />}
          {avgBottledMl && <StatBox label="Avg bottled BM" value={`${avgBottledMl}ml`} sub="per feed" color="bg-teal-50" />}
        </div>
      </div>

      {/* Feed time heatmap */}
      {maxFeedHour > 0 && (
        <div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Feed Times (when baby eats)</p>
          <div className="bg-white rounded-3xl p-4 shadow-sm">
            <div className="flex items-end gap-0.5" style={{ height: 48 }}>
              {feedHours.map((count, h) => (
                <div key={h} className="flex-1 flex flex-col justify-end">
                  <div
                    className="rounded-sm bg-rose-400 transition-all"
                    style={{ height: maxFeedHour > 0 ? `${Math.round((count / maxFeedHour) * 100)}%` : '0%', minHeight: count > 0 ? 3 : 0 }}
                  />
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-1 text-xs text-gray-300">
              <span>12a</span><span>6a</span><span>12p</span><span>6p</span><span>12a</span>
            </div>
          </div>
        </div>
      )}

      {/* Sleep */}
      <div>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Sleep</p>
        <div className="grid grid-cols-2 gap-2.5">
          <StatBox label="Avg sleep/day" value={minutesToHm(avgSleepPerDay)} sub="last 7 days" color="bg-violet-50" />
          <StatBox label="Total sessions" value={sleepEvents.length} sub="recorded" color="bg-indigo-50" />
        </div>
      </div>

      {/* Poop colors */}
      {Object.keys(colorCounts).length > 0 && (
        <div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Recent Poop Colors</p>
          <div className="bg-white rounded-3xl p-4 shadow-sm space-y-2">
            {Object.entries(colorCounts).sort((a, b) => b[1] - a[1]).map(([color, count]) => (
              <div key={color} className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-700 w-20 capitalize">{color}</span>
                <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
                  <div className="h-full bg-amber-400 rounded-full" style={{ width: `${Math.round((count / recentPoops.length) * 100)}%` }} />
                </div>
                <span className="text-xs text-gray-400 w-6 text-right">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {events.length === 0 && (
        <div className="text-center py-16 text-gray-300">
          <p className="text-5xl mb-3">📊</p>
          <p className="font-semibold text-gray-400">No data yet</p>
          <p className="text-sm mt-1">Start logging to see analytics</p>
        </div>
      )}
    </div>
  );
}
