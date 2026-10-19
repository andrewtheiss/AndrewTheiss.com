// Small timezone helpers built on Intl so we don't need a date library.
// All itinerary times are stored as LOCAL wall-clock time at the place they
// happen, plus an IANA zone. These helpers turn that into real instants so we
// can compute flight durations and layovers correctly across the date line.

const DAY_MS = 24 * 60 * 60 * 1000;

function tzOffsetMs(utcMs, timeZone) {
  const dtf = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hourCycle: 'h23',
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
  });
  const parts = {};
  dtf.formatToParts(new Date(utcMs)).forEach((p) => {
    if (p.type !== 'literal') parts[p.type] = Number(p.value);
  });
  const asIf = Date.UTC(
    parts.year,
    parts.month - 1,
    parts.day,
    parts.hour === 24 ? 0 : parts.hour,
    parts.minute,
    parts.second
  );
  return asIf - utcMs;
}

/** 'YYYY-MM-DD' + 'HH:mm' in `timeZone` -> Date (real instant). */
export function zonedToUtc(dateStr, timeStr, timeZone) {
  const [y, m, d] = dateStr.split('-').map(Number);
  const [hh, mm] = timeStr.split(':').map(Number);
  const asUtc = Date.UTC(y, m - 1, d, hh, mm);
  const offset = tzOffsetMs(asUtc, timeZone);
  let utc = asUtc - offset;
  const offset2 = tzOffsetMs(utc, timeZone);
  if (offset2 !== offset) utc = asUtc - offset2;
  return new Date(utc);
}

/** Offset label like 'GMT-8' / 'GMT+8' for a zone at a given instant. */
export function gmtLabel(date, timeZone) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    timeZoneName: 'shortOffset',
  }).formatToParts(date);
  return parts.find((p) => p.type === 'timeZoneName')?.value || timeZone;
}

/** 'HH:mm' -> '10:40 PM' */
export function fmtClock(timeStr) {
  const [hh, mm] = timeStr.split(':').map(Number);
  const suffix = hh >= 12 ? 'PM' : 'AM';
  const h12 = hh % 12 === 0 ? 12 : hh % 12;
  return `${h12}:${String(mm).padStart(2, '0')} ${suffix}`;
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** Parse 'YYYY-MM-DD' as a calendar date (no zone). */
export function parseDate(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number);
  return { y, m, d, utc: Date.UTC(y, m - 1, d) };
}

/** 'YYYY-MM-DD' -> 'Sat, Nov 21' */
export function fmtDate(dateStr, { weekday = true } = {}) {
  const { m, d, utc } = parseDate(dateStr);
  const wd = WEEKDAYS[new Date(utc).getUTCDay()];
  return `${weekday ? `${wd}, ` : ''}${MONTHS[m - 1]} ${d}`;
}

/** 0 = Sunday .. 6 = Saturday */
export function weekdayIndex(dateStr) {
  return new Date(parseDate(dateStr).utc).getUTCDay();
}

export function weekdayOf(dateStr) {
  const { utc } = parseDate(dateStr);
  return ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][
    new Date(utc).getUTCDay()
  ];
}

/** Add n days to 'YYYY-MM-DD'. */
export function addDays(dateStr, n) {
  const { utc } = parseDate(dateStr);
  return new Date(utc + n * DAY_MS).toISOString().slice(0, 10);
}

/** Calendar-day difference between two local date strings (b - a). */
export function dayDiff(a, b) {
  return Math.round((parseDate(b).utc - parseDate(a).utc) / DAY_MS);
}

/** ms -> '14h 40m' */
export function fmtDuration(ms) {
  const totalMin = Math.round(ms / 60000);
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

/** Live clock string for a zone, e.g. 'Mon 3:42 PM'. */
export function fmtNowIn(timeZone, now = new Date()) {
  return new Intl.DateTimeFormat('en-US', {
    timeZone,
    weekday: 'short',
    hour: 'numeric',
    minute: '2-digit',
  }).format(now);
}

/** Today's calendar date ('YYYY-MM-DD') in a zone. */
export function todayIn(timeZone, now = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(now);
  const get = (t) => parts.find((p) => p.type === t).value;
  return `${get('year')}-${get('month')}-${get('day')}`;
}
