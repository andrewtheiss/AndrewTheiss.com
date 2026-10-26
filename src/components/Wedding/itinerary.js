// Wedding trip itinerary. Every time here is LOCAL wall-clock time at the place
// it happens (what a clock on the wall would say when you're standing there).
// The page never converts these; it only uses the zone to compute durations.
//
// Travelers: `who` is 'us' (Andrew & Cassie), 'mom' (Trudy), or 'all' (everyone).
//
// To add something: push an entry onto `extras` with a `day` (YYYY-MM-DD),
// an optional `time` (HH:mm, 24h), a `type`, a `title` and optional `detail`.
//
// Bookings are flights by default. A hotel is `kind: 'hotel'` with a `name`
// instead of `airline`, and `refLabel` names what `pnr` holds (e.g. an Expedia
// itinerary number).

export const TZ = {
  LA: { id: 'America/Los_Angeles', label: 'Los Angeles', short: 'LA' },
  TPE: { id: 'Asia/Taipei', label: 'Taipei', short: 'Taipei' },
  PH: { id: 'Asia/Manila', label: 'Philippines', short: 'PH' },
};

export const TRIP_START = '2026-11-20';
export const TRIP_DAYS = 16; // Nov 20 .. Dec 5

export const WHO = {
  us: { key: 'us', label: 'Andrew & Cassie', short: 'Us' },
  mom: { key: 'mom', label: 'Mom (Trudy)', short: 'Mom' },
  all: { key: 'all', label: 'Everyone', short: 'All' },
};

export const WEDDING = {
  title: 'Theiss Wedding',
  date: '2026-11-27',
  venue: 'Lio Beach / Seda Lio Resort, El Nido, Palawan',
  tz: TZ.PH,
};

export const bookings = [
  {
    id: 'ci-us',
    who: 'us',
    airline: 'China Airlines',
    legs: 'LAX ⇄ CEB via TPE · Nov 21 & Dec 5',
    pnr: null,
    ticket: null,
    url: 'https://www.china-airlines.com/us/en',
    status: 'Round trip. Add your PNR here when you find it.',
  },
  {
    id: 'ci-mom',
    who: 'mom',
    airline: 'China Airlines',
    legs: 'LAX → TPE → CEB · Nov 21',
    pnr: 'EVUVXW',
    ticket: '297 2424880871',
    url: 'https://www.china-airlines.com/us/en',
    status: 'Same flights as us. No schedule changes reported.',
  },
  {
    id: 'dg-us',
    who: 'us',
    airline: 'Cebu Pacific / Cebgo',
    legs: 'CEB → ENI · Nov 24 · DG 6250',
    pnr: 'FNH23X',
    ticket: null,
    url: 'https://www.cebupacificair.com/',
    status: 'Rescheduled again: now DG 6250 at 8:35 AM (was 9:20 AM, then 6:50 PM).',
    changed: true,
  },
  {
    id: 'dg-mom',
    who: 'mom',
    airline: 'Cebu Pacific / Cebgo',
    legs: 'CEB ⇄ ENI · Nov 24 & Nov 28 · DG 6250 / DG 6255',
    pnr: 'VPGPTX',
    ticket: null,
    url: 'https://www.cebupacificair.com/',
    status: 'Outbound DG 6250 at 8:35 AM (same flight as ours), back on DG 6255 at 4:40 PM.',
    changed: true,
  },
  {
    id: 'dg-us-bohol',
    who: 'us',
    airline: 'Cebu Pacific / Cebgo',
    legs: 'ENI → TAG · Nov 29 · DG 6887',
    pnr: 'XQZY8H',
    ticket: null,
    url: 'https://www.cebupacificair.com/',
    status: 'Confirmed Oct 21. El Nido → Bohol (Panglao), 1:35 PM – 3:20 PM.',
  },
  {
    id: 'lime-bohol',
    who: 'us',
    kind: 'hotel',
    name: 'LIME Resort Bohol',
    legs: 'Barrio of Tangnan, Panglao · Nov 29 – Dec 3 · 4 nights',
    pnr: '73572374870256',
    refLabel: 'Expedia itinerary',
    ticket: null,
    url: 'https://www.expedia.com/trips/73572374870256',
    status:
      'Confirmed Oct 26. Villa, 1 Bedroom, Beachfront (Duplex), 2 adults. Full breakfast and Wi-Fi included. Check-in from 3:00 PM, check-out by 12:00 PM. $851.37 total ($194.75 × 4 nights + $93.48 tax, minus $21.11 OneKeyCash). Radisson Individuals Premier.',
  },
  {
    id: 'pr-mom',
    who: 'mom',
    airline: 'Philippine Airlines',
    legs: 'CEB → MNL → LAX · Nov 30',
    pnr: 'YJGAFM',
    ticket: '079 2542074915',
    url: 'https://www.philippineairlines.com/',
    status: 'Minor change: CEB departure 11:00 AM → 11:15 AM',
    changed: true,
  },
];

// Journeys group flights so layovers can be computed between consecutive legs.
export const journeys = [
  {
    id: 'outbound',
    name: 'Outbound: Los Angeles → Cebu',
    bookingId: 'ci-us',
    who: 'all',
    flights: [
      {
        id: 'ci7',
        airline: 'China Airlines',
        number: 'CI 7',
        seat: 'Mom 41H · ours TBD',
        from: { code: 'LAX', city: 'Los Angeles', terminal: 'Terminal B', tz: TZ.LA, date: '2026-11-21', time: '22:40' },
        to: { code: 'TPE', city: 'Taipei Taoyuan', terminal: 'Terminal 2', tz: TZ.TPE, date: '2026-11-23', time: '05:20' },
      },
      {
        id: 'ci705',
        airline: 'China Airlines',
        number: 'CI 705',
        seat: 'Mom 41H · ours TBD',
        from: { code: 'TPE', city: 'Taipei Taoyuan', terminal: 'Terminal 1', tz: TZ.TPE, date: '2026-11-23', time: '08:10' },
        to: { code: 'CEB', city: 'Cebu Mactan', terminal: 'Terminal 2', tz: TZ.PH, date: '2026-11-23', time: '11:10' },
      },
    ],
  },
  {
    id: 'regional',
    name: 'Cebu → El Nido',
    bookingId: 'dg-us',
    who: 'all',
    flights: [
      {
        id: 'dg6250',
        airline: 'Cebu Pacific (operated by Cebgo)',
        number: 'DG 6250',
        seat: '12A (Andrew) · 12B (Cassie) · Mom 2B (verify)',
        from: { code: 'CEB', city: 'Cebu Mactan', terminal: 'Terminal 1', tz: TZ.PH, date: '2026-11-24', time: '08:35' },
        to: { code: 'ENI', city: 'El Nido', terminal: null, tz: TZ.PH, date: '2026-11-24', time: '10:25' },
        change: {
          summary: 'Rescheduled by the airline',
          detail: "Originally DG 5337 at 9:20 AM, then moved to DG 6254 at 6:50 PM. Manage Booking now shows DG 6250 at 8:35 AM on both our booking (FNH23X) and Mom's (VPGPTX), so everyone is on the same morning flight.",
        },
      },
    ],
  },
  {
    id: 'eni-ceb-mom',
    name: 'Mom: El Nido → Cebu',
    bookingId: 'dg-mom',
    who: 'mom',
    flights: [
      {
        id: 'dg6255',
        airline: 'Cebu Pacific (operated by Cebgo)',
        number: 'DG 6255',
        seat: '1C',
        from: { code: 'ENI', city: 'El Nido', terminal: null, tz: TZ.PH, date: '2026-11-28', time: '16:40' },
        to: { code: 'CEB', city: 'Cebu Mactan', terminal: 'Terminal 1', tz: TZ.PH, date: '2026-11-28', time: '18:25' },
      },
    ],
  },
  {
    id: 'eni-tag-us',
    name: 'Us: El Nido → Bohol',
    bookingId: 'dg-us-bohol',
    who: 'us',
    flights: [
      {
        id: 'dg6887',
        airline: 'Cebu Pacific (operated by Cebgo)',
        number: 'DG 6887',
        seat: 'TBD',
        from: { code: 'ENI', city: 'El Nido', terminal: null, tz: TZ.PH, date: '2026-11-29', time: '13:35' },
        to: { code: 'TAG', city: 'Bohol Panglao', terminal: null, tz: TZ.PH, date: '2026-11-29', time: '15:20' },
      },
    ],
  },
  {
    id: 'return-mom',
    name: 'Mom: Cebu → Manila → Los Angeles',
    bookingId: 'pr-mom',
    who: 'mom',
    flights: [
      {
        id: 'pr2850',
        airline: 'Philippine Airlines (PAL Express)',
        number: 'PR 2850',
        seat: '44C',
        from: { code: 'CEB', city: 'Cebu Mactan', terminal: 'Terminal 1', tz: TZ.PH, date: '2026-11-30', time: '11:15' },
        to: { code: 'MNL', city: 'Manila Ninoy Aquino', terminal: 'Terminal 2', tz: TZ.PH, date: '2026-11-30', time: '12:35' },
        change: {
          summary: 'Time shifted slightly',
          detail: 'Departure moved from 11:00 AM to 11:15 AM.',
        },
      },
      {
        id: 'pr122',
        airline: 'Philippine Airlines',
        number: 'PR 122',
        seat: '43C',
        from: { code: 'MNL', city: 'Manila Ninoy Aquino', terminal: 'Terminal 1', tz: TZ.PH, date: '2026-11-30', time: '15:15' },
        to: { code: 'LAX', city: 'Los Angeles', terminal: 'Terminal B', tz: TZ.LA, date: '2026-11-30', time: '12:10' },
      },
    ],
  },
  {
    id: 'return-us',
    name: 'Us: Cebu → Taipei → Los Angeles',
    bookingId: 'ci-us',
    who: 'us',
    flights: [
      {
        id: 'ci706',
        airline: 'China Airlines',
        number: 'CI 706',
        seat: 'TBD',
        from: { code: 'CEB', city: 'Cebu Mactan', terminal: 'Terminal 2', tz: TZ.PH, date: '2026-12-05', time: '12:10' },
        to: { code: 'TPE', city: 'Taipei Taoyuan', terminal: 'Terminal 1', tz: TZ.TPE, date: '2026-12-05', time: '14:55' },
      },
      {
        id: 'ci8',
        airline: 'China Airlines',
        number: 'CI 8',
        seat: 'TBD',
        from: { code: 'TPE', city: 'Taipei Taoyuan', terminal: 'Terminal 2', tz: TZ.TPE, date: '2026-12-05', time: '23:50' },
        to: { code: 'LAX', city: 'Los Angeles', terminal: 'Terminal B', tz: TZ.LA, date: '2026-12-05', time: '19:25' },
      },
    ],
  },
];

// Where you'll physically be each day, used for the day header's zone label.
// Days not listed fall back to the previous entry.
export const whereabouts = [
  { from: '2026-11-20', place: 'Los Angeles', tz: TZ.LA },
  { from: '2026-11-22', place: 'In the air (crossing the date line)', tz: TZ.TPE },
  { from: '2026-11-23', place: 'Cebu', tz: TZ.PH },
  { from: '2026-11-24', place: 'Cebu → El Nido', tz: TZ.PH },
  { from: '2026-11-25', place: 'El Nido, Palawan', tz: TZ.PH },
  { from: '2026-11-29', place: 'El Nido → Bohol', tz: TZ.PH },
  { from: '2026-11-30', place: 'Panglao, Bohol (LIME Resort)', tz: TZ.PH },
  { from: '2026-12-03', place: 'Leaving Bohol (Dec 3 – 5 plans TBD)', tz: TZ.PH },
  { from: '2026-12-05', place: 'Cebu → Taipei → Los Angeles', tz: TZ.PH },
];

// Non-flight items. type: 'event' | 'stay' | 'todo' | 'note'
export const extras = [
  {
    day: '2026-11-20',
    type: 'note',
    title: 'Pack & prep day',
    detail: 'Flight is tomorrow night. Confirm passports, PNRs, the El Nido hotel, and the Bohol villa (Expedia 73572374870256). Mom flies out with us.',
  },
  {
    day: '2026-11-22',
    type: 'note',
    title: 'This day mostly disappears',
    detail: 'You take off Saturday night LA time and land Monday morning Taipei time. Sunday is spent in the air and swallowed by the International Date Line.',
  },
  {
    day: '2026-11-23',
    type: 'todo',
    title: 'Lodging in Cebu (Nov 23 – 24), all three of us',
    detail: 'Not booked yet. We land late morning. All three of us fly to El Nido the next morning at 8:35 AM.',
  },
  {
    day: '2026-11-24',
    type: 'todo',
    title: 'Lodging in El Nido (Nov 24 – 26)',
    detail: 'Not booked yet. Everyone lands 10:25 AM on DG 6250. Seda Lio stay starts Nov 26.',
  },
  {
    day: '2026-11-25',
    type: 'note',
    title: 'Free until the Welcome Dinner',
    detail: 'First full day in Palawan. Welcome Dinner at Molave, 6:00 PM.',
  },
  {
    day: '2026-11-26',
    type: 'stay',
    title: 'Check in: Seda Lio Resort',
    detail: 'Recommended wedding stay Nov 26 – 28. Lio Beach, El Nido.',
  },
  {
    day: '2026-11-27',
    type: 'event',
    title: 'Theiss Wedding',
    detail: 'Lio Beach / Seda Lio Resort. Ceremony 4:30 PM at the Beachfront, reception 6:30 PM. Full run-of-show below.',
    highlight: true,
  },
  {
    day: '2026-11-28',
    type: 'stay',
    title: 'Check out: Seda Lio Resort',
    detail: 'End of the recommended wedding stay. Mom heads back to Cebu; we stay one more night in El Nido.',
  },
  {
    day: '2026-11-28',
    type: 'stay',
    title: 'Extra night in El Nido (Cassie & Andrew)',
    detail: 'We extended one more night, through the evening of the 28th. Mom flies back to Cebu on DG 6255 at 4:40 PM; we fly to Bohol tomorrow at 1:35 PM.',
  },
  {
    day: '2026-11-29',
    time: '15:00',
    type: 'stay',
    title: 'Check in: LIME Resort Bohol',
    detail:
      'Villa, 1 Bedroom, Beachfront (Duplex), 2 adults, four nights through Dec 3. Check-in opens 3:00 PM; we land at TAG at 3:20 PM. Barrio of Tangnan, Panglao. Full breakfast and Wi-Fi included. Expedia itinerary 73572374870256. A member of Radisson Individuals Premier.',
  },
  {
    day: '2026-11-29',
    type: 'todo',
    title: 'Lodging for Mom in Cebu (Nov 28 – 30)',
    detail: 'She lands in Cebu Nov 28 at 6:25 PM and flies home Nov 30 at 11:15 AM.',
  },
  {
    day: '2026-11-30',
    type: 'note',
    title: 'Mom flies home',
    detail: 'Cebu Terminal 1 at 11:15 AM via Manila. She lands at LAX the same afternoon, local time.',
  },
  {
    day: '2026-12-03',
    time: '12:00',
    type: 'stay',
    title: 'Check out: LIME Resort Bohol',
    detail: 'Check-out by 12:00 PM. Four nights, Nov 29 – Dec 3. Nothing is booked after this.',
  },
  {
    day: '2026-12-03',
    type: 'todo',
    title: 'Lodging Dec 3 – 5 & the way back to Cebu',
    detail: 'Bohol is covered through check-out on Dec 3. Still need two nights somewhere (Dec 3 – 5) and a flight or fast ferry back to Cebu in time for our Dec 5, 12:10 PM departure from Cebu Terminal 2.',
    urgent: true,
  },
];

// One-line summary shown on the overview card for a day (optional).
export const dayHeadlines = {
  '2026-11-25': 'Welcome Dinner at Molave, 6:00 PM',
  '2026-11-26': 'Island hopping, then rehearsal 4:30 PM',
  '2026-11-27': 'Ceremony 4:30 PM, reception 6:30 PM',
};

// Minute-by-minute run-of-show. Times are local (Philippines).
// Each entry is one time slot; `section` starts a new labelled section.
export const schedule = [
  // ---- Wed Nov 25: Welcome Dinner ----
  { day: '2026-11-25', section: 'Welcome Dinner', time: '18:00', items: [{ tag: 'START', text: 'Welcome Dinner', place: 'Molave' }] },
  { day: '2026-11-25', time: '22:00', items: [{ text: 'End of Dinner' }] },

  // ---- Thu Nov 26: Guest Activities & Rehearsal ----
  { day: '2026-11-26', section: 'Guest Activities & Rehearsal', time: '09:00', items: [{ tag: 'ASSEMBLY', text: 'Guests', place: 'Seda Beachfront' }] },
  { day: '2026-11-26', time: '10:00', items: [{ tag: 'START', text: 'Island Hopping', place: 'Leatherback' }] },
  { day: '2026-11-26', time: '16:00', items: [{ tag: 'BACK', text: 'To Seda' }] },
  { day: '2026-11-26', time: '16:30', items: [{ tag: 'START', text: 'Entourage Rehearsal' }] },
  {
    day: '2026-11-26',
    section: 'Preps / Setup',
    items: [
      { text: 'Preps rooms', bold: true },
      { text: 'Beachfront', bold: true },
      { text: 'AM setup c/o event stylist' },
    ],
  },

  // ---- Fri Nov 27: Wedding Day ----
  { day: '2026-11-27', section: 'Morning Preparations', time: '07:00', items: [{ tag: 'RISE AND SHINE!', text: 'Shower and Breakfast' }] },
  { day: '2026-11-27', time: '07:30', items: [{ text: 'Room service for Cassie & Andrew' }] },
  { day: '2026-11-27', time: '08:30', items: [{ tag: 'ARRIVE', text: 'Tanya & Team' }, { tag: 'ARRIVE', text: 'CWE Team' }] },
  { day: '2026-11-27', time: '09:00', items: [{ tag: 'START', text: 'Entourage HMU' }] },
  { day: '2026-11-27', time: '09:30', items: [{ tag: 'START', text: 'Bridal HMU' }] },
  { day: '2026-11-27', time: '10:00', items: [{ tag: 'ARRIVE', text: 'El Nido Photography' }, { tag: 'SHOOT', text: 'Details, including bouquet' }] },
  {
    day: '2026-11-27',
    time: '11:45',
    items: [
      { tag: 'SHOOT', text: 'Bridal Robe (indoor)' },
      { text: "Cassie may have an early lunch while waiting for the bride's squad", note: true },
    ],
  },
  { day: '2026-11-27', time: '12:45', items: [{ tag: 'SHOOT', text: "Pre-gown with bride's squad (outdoor)" }] },
  { day: '2026-11-27', time: '13:30', items: [{ text: 'Lunch Break' }] },
  { day: '2026-11-27', time: '14:00', items: [{ tag: 'BRIDAL HAIR', text: 'Up, Ceremony Look' }] },
  {
    day: '2026-11-27',
    time: '14:45',
    items: [
      { tag: 'START', text: "Groom's grooming (optional)" },
      { tag: 'CALL TIME', text: "Groom's squad" },
      { tag: 'CALL TIME', text: "Bride's squad and immediate family, for First Look" },
    ],
  },
  {
    day: '2026-11-27',
    section: 'Wedding Party Photos & Ceremony Setup',
    time: '15:00',
    items: [{ tag: 'SHOOT', text: 'Groom with Groomsmen' }, { tag: 'SHOOT', text: 'Gown shoot with Bridesmaids' }],
  },
  {
    day: '2026-11-27',
    time: '15:30',
    items: [
      { tag: 'SHOOT', text: 'Bride + Family' },
      { tag: 'SHOOT', text: 'Groom + Family' },
      { text: 'Ceremony setup done', bold: true },
      { tag: 'ARRIVE', text: 'Sasha and El Capo Band' },
      { text: 'Sound check' },
    ],
  },
  {
    day: '2026-11-27',
    time: '16:00',
    items: [{ tag: 'SHOOT', text: 'First Look' }, { tag: 'ASSEMBLY', text: 'At Beach Front' }, { tag: 'ARRIVE', text: 'Officiant' }],
  },
  { day: '2026-11-27', time: '16:20', items: [{ text: 'Ask guests to settle down' }, { text: 'Lining up of Entourage' }] },
  {
    day: '2026-11-27',
    section: 'Ceremony & Reception',
    time: '16:30',
    items: [
      { text: 'Bride leaves for ceremony' },
      { text: 'Cocktail setup done', bold: true },
      { tag: 'START', text: 'Processional | Bridal March | Ceremony', highlight: true },
    ],
  },
  {
    day: '2026-11-27',
    time: '17:15',
    items: [
      { text: 'Reception setup done', bold: true },
      { tag: 'END', text: 'Ceremony' },
      { text: 'Pictorial' },
      { text: 'Recessional' },
    ],
  },
  {
    day: '2026-11-27',
    time: '17:30',
    items: [
      { tag: 'START', text: 'Cocktail Hour, couple will join' },
      { tag: 'SHOOT', text: 'Post-Nuptial Shoot, then retouch' },
      { tag: 'ARRIVE', text: 'Host' },
    ],
  },
  { day: '2026-11-27', time: '18:30', items: [{ tag: 'START', text: 'Reception Program', highlight: true }] },
  { day: '2026-11-27', time: '19:00', items: [{ text: 'Reception Dinner' }, { tag: 'ARRIVE', text: 'DJ Meister Lee' }] },
  { day: '2026-11-27', time: '21:00', items: [{ tag: 'END', text: 'Reception | After Party' }] },
];
