export function toDatetimeLocal(isoString) {
  const d = new Date(isoString);
  const pad = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function formatTime(isoString) {
  const d = new Date(isoString);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function formatDate(isoString) {
  const d = new Date(isoString);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (d.toDateString() === today.toDateString()) return 'Today';
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return d.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
}

export function formatDuration(minutes) {
  if (!minutes) return '';
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

export function formatElapsed(startIso) {
  const diff = Math.floor((Date.now() - new Date(startIso)) / 1000);
  const h = Math.floor(diff / 3600);
  const m = Math.floor((diff % 3600) / 60);
  const s = diff % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function timeSince(isoString) {
  const diff = Math.floor((Date.now() - new Date(isoString)) / 60000);
  if (diff < 1) return 'just now';
  if (diff < 60) return `${diff}m ago`;
  const h = Math.floor(diff / 60);
  const m = diff % 60;
  if (h < 24) return m > 0 ? `${h}h ${m}m ago` : `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export function getEventIcon(type) {
  const icons = {
    pee:         '💧',
    poop:        '💩',
    feed:        '🍼',
    sleep:       '😴',
    hygiene:     '🛁',
    diaper_care: '🧴',
    dress:       '👗',
    pump:        '🍼',
    note:        '📝',
    weight:      '⚖️',
    temperature: '🌡️',
    medicine:    '💊',
  };
  return icons[type] || '📋';
}

export function getEventLabel(event) {
  switch (event.type) {
    case 'pee': return 'Pee';
    case 'poop': return event.poopColor ? `Poop · ${event.poopColor}` : 'Poop';
    case 'feed': {
      if (event.feedType === 'breast') {
        const side = event.side ? ` · ${event.side}` : '';
        const dur = event.duration ? ` · ${event.duration}m` : '';
        return `Breast${side}${dur}`;
      }
      if (event.feedType === 'bottled_bm') {
        const qty = event.quantity ? ` · ${event.quantity}ml` : '';
        const dur = event.duration ? ` · ${event.duration}m` : '';
        return `Bottled BM${qty}${dur}`;
      }
      const qty = event.quantity ? ` · ${event.quantity}ml` : '';
      const dur = event.duration ? ` · ${event.duration}m` : '';
      return `Formula${qty}${dur}`;
    }
    case 'sleep': {
      if (event.duration) return `Sleep · ${formatDuration(event.duration)}`;
      return event.sleeping ? 'Sleep started' : 'Sleep';
    }
    case 'weight': return event.weight ? `Weight · ${event.weight}g` : 'Weight';
    case 'temperature': return event.temp ? `Temp · ${event.temp}°C` : 'Temperature';
    case 'medicine': return event.medicineName || 'Medicine';
    case 'pump': {
      const parts = [];
      if (event.side) parts.push(event.side === 'both' ? 'Both sides' : event.side === 'left' ? 'Left' : 'Right');
      if (event.side === 'both' && (event.leftMl || event.rightMl)) {
        parts.push(`L:${event.leftMl || 0}ml R:${event.rightMl || 0}ml`);
      } else if (event.quantity) {
        parts.push(`${event.quantity}ml`);
      }
      if (event.duration) parts.push(`${event.duration}min`);
      return `Pump · ${parts.join(' · ')}`;
    }
    case 'dress': {
      const labels = {
        footie:              'Footie / Sleepsuit',
        longsleeve_pants:    'Long Sleeve + Pants',
        shortsleeeve_pants:  'Short Sleeve + Pants',
        longsleeeve_shorts:  'Long Sleeve + Shorts',
        onesie_short:        'Onesie',
        swaddle:             'Swaddle',
        just_diaper:         'Just Diaper',
      };
      return labels[event.dressType] || 'Dress Change';
    }
    case 'hygiene': {
      const labels = { full_bath: 'Full Bath', sponge_bath: 'Sponge Bath', butt_water: 'Butt Wash', wipe: 'Wipe' };
      return labels[event.washType] || 'Hygiene';
    }
    case 'diaper_care': {
      const parts = [];
      if (event.rashLevel && event.rashLevel !== 'none') parts.push(`Rash: ${event.rashLevel}`);
      if (event.ointmentApplied) parts.push(event.ointmentName || 'Ointment applied');
      return parts.length ? `Diaper Care · ${parts.join(', ')}` : 'Diaper Care';
    }
    case 'note': return event.note || 'Note';
    default: return event.type;
  }
}
