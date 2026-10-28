import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { AuthUserContext } from '../Session';
import { canEditWeddingTodos } from '../../constants/wedding';
import TodoPanel from './TodoPanel';
import {
  TZ,
  TRIP_START,
  TRIP_DAYS,
  WEDDING,
  bookings,
  journeys,
  whereabouts,
  extras,
  schedule,
  dayHeadlines,
  WHO,
} from './itinerary';
import {
  zonedToUtc,
  gmtLabel,
  fmtClock,
  fmtDate,
  weekdayOf,
  addDays,
  dayDiff,
  fmtDuration,
  fmtNowIn,
  todayIn,
  weekdayIndex,
} from './timezone';
import './Wedding.css';

/* ---------- derived data ---------- */

// A journey leg is a flight unless it says `mode: 'ferry'`.
const MODES = {
  flight: { icon: '✈', travel: 'in the air', departed: 'Took off', seatLabel: 'Seat' },
  ferry: { icon: '⛴', travel: 'on the water', departed: 'Sailed', seatLabel: 'Class' },
};
const modeOf = (leg) => MODES[leg.mode] || MODES.flight;

function flightInstants(f) {
  const dep = zonedToUtc(f.from.date, f.from.time, f.from.tz.id);
  const arr = zonedToUtc(f.to.date, f.to.time, f.to.tz.id);
  return { dep, arr, durationMs: arr - dep, dayShift: dayDiff(f.from.date, f.to.date) };
}

function whereFor(day) {
  let current = whereabouts[0];
  whereabouts.forEach((w) => {
    if (w.from <= day) current = w;
  });
  return current;
}

function buildDays() {
  const byDay = {};
  const push = (day, item) => {
    if (!byDay[day]) byDay[day] = [];
    byDay[day].push(item);
  };
  const keyFor = (day, time, tzId) =>
    time ? zonedToUtc(day, time, tzId).getTime() : -Infinity;

  journeys.forEach((journey) => {
    const who = journey.who || 'us';
    journey.flights.forEach((f, i) => {
      const inst = flightInstants(f);
      push(f.from.date, { kind: 'flight', sortKey: inst.dep.getTime(), flight: f, inst, journey, who });
      if (f.to.date !== f.from.date) {
        push(f.to.date, { kind: 'arrival', sortKey: inst.arr.getTime(), flight: f, inst, journey, who });
      }
      const next = journey.flights[i + 1];
      if (next) {
        const nextInst = flightInstants(next);
        push(f.to.date, {
          kind: 'layover',
          sortKey: inst.arr.getTime() + 1,
          flight: f,
          next,
          who,
          ms: nextInst.dep - inst.arr,
          terminalChange:
            f.to.terminal && next.from.terminal && f.to.terminal !== next.from.terminal,
        });
      }
    });
  });

  extras.forEach((x) => {
    push(x.day, { kind: 'extra', sortKey: keyFor(x.day, x.time, whereFor(x.day).tz.id), extra: x });
  });

  schedule.forEach((slot) => {
    push(slot.day, {
      kind: 'slot',
      // untimed slots (setup notes) go at the end of the day
      sortKey: slot.time ? keyFor(slot.day, slot.time, whereFor(slot.day).tz.id) : Infinity,
      slot,
    });
  });

  // Align the grid to full Sunday..Saturday weeks around the trip.
  const tripEnd = addDays(TRIP_START, TRIP_DAYS - 1);
  const gridStart = addDays(TRIP_START, -weekdayIndex(TRIP_START));
  const gridEnd = addDays(tripEnd, 6 - weekdayIndex(tripEnd));
  const gridDays = dayDiff(gridStart, gridEnd) + 1;

  return Array.from({ length: gridDays }, (_, i) => {
    const day = addDays(gridStart, i);
    const inTrip = day >= TRIP_START && day <= tripEnd;
    const items = (byDay[day] || []).sort((a, b) => a.sortKey - b.sortKey);
    return { day, inTrip, where: whereFor(day), items, summary: summarize(day, items) };
  });
}

const WEEKDAY_HEADERS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/** Short lines for the overview card. */
function summarize(day, items) {
  const lines = [];
  if (dayHeadlines[day]) lines.push({ icon: '💍', text: dayHeadlines[day], strong: true });
  items.forEach((it) => {
    if (it.kind === 'flight') {
      lines.push({
        icon: modeOf(it.flight).icon,
        who: it.who,
        text: `${it.flight.from.code} → ${it.flight.to.code} · ${fmtClock(it.flight.from.time)}`,
        tag: it.inst.dayShift > 0 ? `+${it.inst.dayShift}d` : null,
      });
    } else if (it.kind === 'arrival') {
      lines.push({
        icon: '🛬',
        who: it.who,
        text: `Land ${it.flight.to.code} · ${fmtClock(it.flight.to.time)}`,
      });
    } else if (it.kind === 'extra' && it.extra.type === 'stay') {
      lines.push({ icon: '🏨', text: it.extra.title });
    } else if (it.kind === 'extra' && it.extra.type === 'todo') {
      lines.push({ icon: '⚠️', text: it.extra.title, urgent: it.extra.urgent });
    }
  });
  const hiddenNotes = items.filter(
    (it) => it.kind === 'layover' || it.kind === 'slot' || (it.kind === 'extra' && it.extra.type === 'note')
  ).length;
  const MAX = 5;
  const shown = lines.slice(0, MAX);
  const more = lines.length - shown.length + hiddenNotes;
  return { lines: shown, more };
}

/* ---------- shared pieces ---------- */

const ZoneTag = ({ tz, date }) => (
  <span className="wd-zone">
    {tz.short} time · {gmtLabel(date, tz.id)}
  </span>
);

const DayShift = ({ n }) => {
  if (n === 0) return <span className="wd-shift same">same day</span>;
  return (
    <span className="wd-shift">
      {n > 0 ? '+' : ''}
      {n} day{Math.abs(n) === 1 ? '' : 's'}
    </span>
  );
};

const Endpoint = ({ side, ep, inst, dayShift }) => (
  <div className={`wd-endpoint ${side}`}>
    <div className="wd-ep-time">
      {fmtClock(ep.time)}
      {side === 'to' && <DayShift n={dayShift} />}
    </div>
    <div className="wd-ep-date">{fmtDate(ep.date)}</div>
    <div className="wd-ep-place">
      <strong>{ep.code}</strong> {ep.city}
      {ep.terminal ? ` · ${ep.terminal}` : ''}
    </div>
    <ZoneTag tz={ep.tz} date={side === 'from' ? inst.dep : inst.arr} />
  </div>
);

const WHO_TEXT = {
  all: 'Mom is on this flight with us',
  mom: 'Mom only',
  us: 'Andrew & Cassie',
};

const WhoBadge = ({ who, compact }) => (
  <span className={`wd-who who-${who}`} title={WHO_TEXT[who]}>
    {compact ? WHO[who].short : WHO_TEXT[who]}
  </span>
);

const FlightCard = ({ flight, inst, journey, who = 'us' }) => {
  const booking = bookings.find((b) => b.id === journey.bookingId);
  const mode = modeOf(flight);
  return (
    <div className={`wd-item wd-flight who-${who}`}>
      <div className="wd-flight-head">
        <span className="wd-icon" aria-hidden>{mode.icon}</span>
        <span className="wd-flight-number">{flight.number}</span>
        <span className="wd-flight-airline">{flight.airline}</span>
        <WhoBadge who={who} />
        <span className="wd-duration">{fmtDuration(inst.durationMs)} {mode.travel}</span>
      </div>
      <div className="wd-flight-body">
        <Endpoint side="from" ep={flight.from} inst={inst} dayShift={inst.dayShift} />
        <div className="wd-arrow" aria-hidden>→</div>
        <Endpoint side="to" ep={flight.to} inst={inst} dayShift={inst.dayShift} />
      </div>
      <div className="wd-flight-meta">
        <span>{mode.seatLabel} {flight.seat}</span>
        {booking && <span>{booking.refLabel || 'PNR'} {booking.pnr}</span>}
        {booking?.ticket && <span>{booking.ticketLabel || 'Ticket'} {booking.ticket}</span>}
      </div>
      {flight.change && (
        <div className="wd-change">
          <strong>{flight.change.summary}.</strong> {flight.change.detail}
        </div>
      )}
    </div>
  );
};

const ArrivalCard = ({ flight, inst, who = 'us' }) => (
  <div className={`wd-item wd-arrival who-${who}`}>
    <span className="wd-icon" aria-hidden>🛬</span>
    <div>
      <div className="wd-item-title">
        Land in {flight.to.city} at {fmtClock(flight.to.time)}{' '}
        <ZoneTag tz={flight.to.tz} date={inst.arr} />
        {who !== 'us' && <WhoBadge who={who} compact />}
      </div>
      <div className="wd-item-detail">
        {flight.number} from {flight.from.code}. {modeOf(flight).departed}{' '}
        {weekdayOf(flight.from.date)} {fmtClock(flight.from.time)} {flight.from.tz.short} time;{' '}
        {fmtDuration(inst.durationMs)} {modeOf(flight).travel}.
      </div>
    </div>
  </div>
);

const LayoverCard = ({ flight, next, ms, terminalChange, who = 'us' }) => (
  <div className={`wd-item wd-layover who-${who}`}>
    <span className="wd-icon" aria-hidden>⏳</span>
    <div>
      <div className="wd-item-title">
        {fmtDuration(ms)} layover in {flight.to.city}
        {who !== 'us' && <WhoBadge who={who} compact />}
      </div>
      <div className="wd-item-detail">
        {fmtClock(flight.to.time)} → {fmtClock(next.from.time)} {flight.to.tz.short} time.
        {terminalChange
          ? ` Terminal change: arrive ${flight.to.terminal}, depart ${next.from.terminal}.`
          : ' Same terminal.'}
      </div>
    </div>
  </div>
);

const ICONS = { event: '💍', stay: '🏨', todo: '⚠️', note: '📝' };

const ExtraCard = ({ extra }) => (
  <div
    className={`wd-item wd-extra wd-${extra.type} ${extra.highlight ? 'highlight' : ''} ${
      extra.urgent ? 'urgent' : ''
    }`}
  >
    <span className="wd-icon" aria-hidden>{ICONS[extra.type] || '•'}</span>
    <div>
      <div className="wd-item-title">
        {extra.time && <span className="wd-extra-time">{fmtClock(extra.time)} · </span>}
        {extra.title}
      </div>
      {extra.detail && <div className="wd-item-detail">{extra.detail}</div>}
      {extra.link && (
        <a className="wd-item-link" href={extra.link.url} target="_blank" rel="noreferrer">
          {extra.link.label || extra.link.url} ↗
        </a>
      )}
    </div>
  </div>
);

/** One time slot of the run-of-show. */
const SlotRow = ({ slot }) => (
  <>
    {slot.section && <div className="wd-section-label">{slot.section}</div>}
    <div className={`wd-slot ${slot.time ? '' : 'untimed'}`}>
      <div className="wd-slot-time">{slot.time ? fmtClock(slot.time) : ''}</div>
      <ul className="wd-slot-items">
        {slot.items.map((it, i) => (
          <li
            key={i}
            className={`${it.note ? 'note' : ''} ${it.bold ? 'bold' : ''} ${
              it.highlight ? 'highlight' : ''
            }`}
          >
            {it.tag && <span className="wd-tag">{it.tag}</span>}
            <span>{it.text}</span>
            {it.place && <span className="wd-place">{it.place}</span>}
          </li>
        ))}
      </ul>
    </div>
  </>
);

const Item = ({ item }) => {
  switch (item.kind) {
    case 'flight':
      return <FlightCard {...item} />;
    case 'arrival':
      return <ArrivalCard {...item} />;
    case 'layover':
      return <LayoverCard {...item} />;
    case 'slot':
      return <SlotRow slot={item.slot} />;
    default:
      return <ExtraCard extra={item.extra} />;
  }
};

/* ---------- overview card ---------- */

const PadDay = ({ day, isToday }) => (
  <div className={`wd-card pad ${isToday ? 'today' : ''}`} aria-hidden>
    <div className="wd-card-head">
      <span className="wd-card-weekday">{weekdayOf(day).slice(0, 3)}</span>
      <span className="wd-card-num">{fmtDate(day, { weekday: false })}</span>
      {isToday && <span className="wd-dot" title="today" />}
    </div>
  </div>
);

const DayCard = ({ day, where, summary, isToday, isWedding, onOpen }) => (
  <button
    type="button"
    className={`wd-card ${isToday ? 'today' : ''} ${isWedding ? 'wedding' : ''} ${
      summary.lines.length === 0 ? 'quiet' : ''
    }`}
    onClick={onOpen}
    aria-label={`Open ${weekdayOf(day)}, ${fmtDate(day, { weekday: false })}`}
  >
    <div className="wd-card-head">
      <span className="wd-card-weekday">{weekdayOf(day).slice(0, 3)}</span>
      <span className="wd-card-num">{fmtDate(day, { weekday: false })}</span>
      {isToday && <span className="wd-dot" title="today" />}
    </div>
    <div className="wd-card-where">{where.place}</div>
    <ul className="wd-card-lines">
      {summary.lines.map((l, i) => (
        <li
          key={i}
          className={`${l.strong ? 'strong' : ''} ${l.urgent ? 'urgent' : ''} ${
            l.who ? `flight who-${l.who}` : ''
          }`}
        >
          <span className="wd-card-icon" aria-hidden>{l.icon}</span>
          <span className="wd-card-text">{l.text}</span>
          {l.who && l.who !== 'us' && <span className={`wd-card-who who-${l.who}`}>M</span>}
          {l.tag && <span className="wd-card-tag">{l.tag}</span>}
        </li>
      ))}
      {summary.more > 0 && <li className="more">+{summary.more} more</li>}
    </ul>
  </button>
);

/* ---------- detail overlay ---------- */

const DayDetail = ({ day, where, items, isWedding, onClose, onPrev, onNext }) => {
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft' && onPrev) onPrev();
      if (e.key === 'ArrowRight' && onNext) onNext();
    };
    window.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose, onPrev, onNext]);

  const noon = zonedToUtc(day, '12:00', where.tz.id);

  return (
    <div className="wd-overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className={`wd-detail ${isWedding ? 'wedding' : ''}`} role="dialog" aria-modal="true">
        <header className="wd-detail-head">
          <button type="button" className="wd-nav" onClick={onPrev} disabled={!onPrev} aria-label="Previous day">
            ‹
          </button>
          <div className="wd-detail-title">
            <div className="wd-detail-date">
              {weekdayOf(day)}, {fmtDate(day, { weekday: false })}
              {isWedding && <span className="wd-pill wedding">wedding day</span>}
            </div>
            <div className="wd-detail-where">
              {where.place} · {where.tz.label} time · {gmtLabel(noon, where.tz.id)}
            </div>
          </div>
          <button type="button" className="wd-nav" onClick={onNext} disabled={!onNext} aria-label="Next day">
            ›
          </button>
          <button type="button" className="wd-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </header>
        <div className="wd-detail-body">
          {items.length === 0 ? (
            <div className="wd-empty">Nothing scheduled yet.</div>
          ) : (
            items.map((item, i) => <Item key={i} item={item} />)
          )}
        </div>
      </div>
    </div>
  );
};

/* ---------- page ---------- */

const WeddingPage = () => {
  const authUser = useContext(AuthUserContext);
  const email = authUser?.user?.email || null;
  const showTodos = canEditWeddingTodos(email);
  const [now, setNow] = useState(() => new Date());
  const [openIndex, setOpenIndex] = useState(null);

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(t);
  }, []);

  const days = useMemo(buildDays, []);
  const tripDays = useMemo(() => days.filter((d) => d.inTrip), [days]);
  const weddingInstant = useMemo(() => zonedToUtc(WEDDING.date, '00:00', WEDDING.tz.id), []);
  const daysToGo = Math.ceil((weddingInstant - now) / 86400000);
  const todayPH = todayIn(TZ.PH.id, now);
  const todayLA = todayIn(TZ.LA.id, now);

  const close = useCallback(() => setOpenIndex(null), []);
  const prev = useMemo(
    () => (openIndex > 0 ? () => setOpenIndex((i) => i - 1) : null),
    [openIndex]
  );
  const next = useMemo(
    () =>
      openIndex !== null && openIndex < tripDays.length - 1
        ? () => setOpenIndex((i) => i + 1)
        : null,
    [openIndex, tripDays.length]
  );

  const open = openIndex !== null ? tripDays[openIndex] : null;

  return (
    <div className="wedding-page">
      {showTodos && <TodoPanel email={email} />}
      <header className="wd-hero">
        <div>
          <h2>{WEDDING.title}</h2>
          <p className="wd-sub">
            {weekdayOf(WEDDING.date)}, {fmtDate(WEDDING.date, { weekday: false })}, 2026 ·{' '}
            {WEDDING.venue}
          </p>
          <p className="wd-note">
            All times are local to where you'll be standing. Nothing is converted to your current
            timezone. Tap a day for the full schedule.
          </p>
          <div className="wd-legend">
            <span className="wd-legend-item who-us"><i /> Our flights</span>
            <span className="wd-legend-item who-all"><i /> Mom flying with us</span>
            <span className="wd-legend-item who-mom"><i /> Mom only</span>
          </div>
        </div>
        <div className="wd-stats">
          <div className="wd-stat">
            <span className="wd-stat-num">{daysToGo > 0 ? daysToGo : 0}</span>
            <span className="wd-stat-label">days to go</span>
          </div>
          <div className="wd-stat">
            <span className="wd-stat-num small">{fmtNowIn(TZ.LA.id, now)}</span>
            <span className="wd-stat-label">Los Angeles</span>
          </div>
          <div className="wd-stat">
            <span className="wd-stat-num small">{fmtNowIn(TZ.PH.id, now)}</span>
            <span className="wd-stat-label">El Nido</span>
          </div>
        </div>
      </header>

      <div className="wd-grid">
        {WEEKDAY_HEADERS.map((w) => (
          <div key={w} className="wd-grid-head">
            {w}
          </div>
        ))}
        {days.map((d) => {
          const isToday = d.day === todayPH || d.day === todayLA;
          if (!d.inTrip) return <PadDay key={d.day} day={d.day} isToday={isToday} />;
          return (
            <DayCard
              key={d.day}
              {...d}
              isToday={isToday}
              isWedding={d.day === WEDDING.date}
              onOpen={() => setOpenIndex(tripDays.indexOf(d))}
            />
          );
        })}
      </div>

      <section className="wd-bookings">
        {bookings.map((b) => (
          <a
            key={b.id}
            className={`wd-booking who-${b.who} ${b.kind || 'flight'} ${b.changed ? 'changed' : ''}`}
            href={b.url}
            target="_blank"
            rel="noreferrer"
          >
            <div className="wd-booking-airline">
              {b.name || b.airline}
              <WhoBadge who={b.who} compact />
            </div>
            <div className="wd-booking-legs">{b.legs}</div>
            <div className="wd-booking-ref">
              {b.pnr ? (
                <>
                  {b.refLabel || 'PNR'} <strong>{b.pnr}</strong>
                </>
              ) : (
                <span className="muted">{b.refLabel || 'PNR'} unknown</span>
              )}
              {b.ticket && <span> · {b.ticketLabel || 'Ticket'} {b.ticket}</span>}
            </div>
            <div className="wd-booking-status">{b.status}</div>
            <div className="wd-booking-link">
              {b.kind === 'hotel' ? 'View itinerary ↗' : 'Manage booking ↗'}
            </div>
          </a>
        ))}
      </section>

      {open && (
        <DayDetail
          {...open}
          isWedding={open.day === WEDDING.date}
          onClose={close}
          onPrev={prev}
          onNext={next}
        />
      )}
    </div>
  );
};

export default WeddingPage;
