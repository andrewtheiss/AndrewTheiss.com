import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import WeddingPage from './WeddingPage';
import { AuthUserContext } from '../Session';
import { zonedToUtc, fmtDuration, dayDiff } from './timezone';

// Firestore is not available in tests; emulate the shared to-do doc in memory.
jest.mock('../Firebase/weddingService', () => {
  let listener = null;
  let stored = null;
  return {
    __reset: () => {
      listener = null;
      stored = null;
    },
    subscribeWeddingTodos: (cb) => {
      listener = cb;
      cb(stored);
      return () => {
        listener = null;
      };
    },
    saveWeddingTodos: async (items) => {
      stored = items;
      if (listener) listener(items);
    },
  };
});

const asUser = (email) => ({ auth: true, loading: false, user: { email } });
const renderAs = (email) =>
  render(
    <AuthUserContext.Provider value={asUser(email)}>
      <WeddingPage />
    </AuthUserContext.Provider>,
  );

test('LAX -> TPE overnight flight is 14h 40m and lands two calendar days later', () => {
  const dep = zonedToUtc('2026-11-21', '22:40', 'America/Los_Angeles');
  const arr = zonedToUtc('2026-11-23', '05:20', 'Asia/Taipei');
  expect(fmtDuration(arr - dep)).toBe('14h 40m');
  expect(dayDiff('2026-11-21', '2026-11-23')).toBe(2);
});

test('MNL -> LAX lands the same local calendar day despite 12h 55m in the air', () => {
  const dep = zonedToUtc('2026-11-30', '15:15', 'Asia/Manila');
  const arr = zonedToUtc('2026-11-30', '12:10', 'America/Los_Angeles');
  expect(fmtDuration(arr - dep)).toBe('12h 55m');
});

test('overview shows 16 compact day cards with local-time summaries', () => {
  render(<WeddingPage />);
  expect(screen.getByText('Theiss Wedding', { selector: 'h2' })).toBeInTheDocument();
  expect(screen.getAllByRole('button', { name: /^Open / })).toHaveLength(16);
  // grid is padded out to full Sunday..Saturday weeks: Nov 15 .. Dec 5
  expect(screen.getByText('Nov 15')).toBeInTheDocument();
  expect(screen.getByText('Nov 20')).toBeInTheDocument();
  expect(screen.getByText('Dec 3')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Open Saturday, Dec 5' })).toBeInTheDocument();
  expect(screen.queryByText('Dec 6')).not.toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'Open Sunday, Nov 15' })).not.toBeInTheDocument();
  expect(screen.getByText('LAX → TPE · 10:40 PM')).toBeInTheDocument();
  expect(screen.getByText('+2d')).toBeInTheDocument();
  expect(screen.getByText('Ceremony 4:30 PM, reception 6:30 PM')).toBeInTheDocument();
  expect(screen.getByText('Boat tour 9:00 AM, Welcome Dinner at Molave 6:00 PM')).toBeInTheDocument();
  // detail content is not rendered until a day is opened
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
});

test('clicking a day opens the detailed view, arrows move between days', () => {
  render(<WeddingPage />);
  fireEvent.click(screen.getByRole('button', { name: 'Open Friday, Nov 27' }));
  const dialog = screen.getByRole('dialog');
  expect(dialog).toBeInTheDocument();
  expect(screen.getByText('Morning Preparations')).toBeInTheDocument();
  expect(screen.getByText('Processional | Bridal March | Ceremony')).toBeInTheDocument();
  expect(screen.getByText('DJ Meister Lee')).toBeInTheDocument();
  expect(screen.getByText('Reception | After Party')).toBeInTheDocument();

  fireEvent.click(screen.getByRole('button', { name: 'Previous day' }));
  expect(screen.getByText('Island Hopping')).toBeInTheDocument();
  expect(screen.getByText('Leatherback')).toBeInTheDocument();

  fireEvent.keyDown(window, { key: 'ArrowLeft' });
  expect(screen.getAllByText('Welcome Dinner').length).toBeGreaterThan(0);
  expect(screen.getByText('Molave')).toBeInTheDocument();
  expect(screen.getByText('GO / NO GO')).toBeInTheDocument();
  expect(screen.getByText('Coast Guard weather call, 6:00 – 7:00 AM')).toBeInTheDocument();
  expect(screen.getByText('Boat tour loading')).toBeInTheDocument();

  fireEvent.keyDown(window, { key: 'Escape' });
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
});

test('Coast Guard weather link shows the day before the boat tour and on the tour itself', () => {
  render(<WeddingPage />);
  expect(screen.getByText("Check the weather forecast for tomorrow's boat tour")).toBeInTheDocument();

  fireEvent.click(screen.getByRole('button', { name: 'Open Tuesday, Nov 24' }));
  const link = screen.getByRole('link', { name: /Coast Guard El Nido weather advisory/ });
  expect(link).toHaveAttribute('href', 'https://www.facebook.com/cgs.elnido/');
  expect(link).toHaveAttribute('target', '_blank');

  fireEvent.click(screen.getByRole('button', { name: 'Next day' }));
  expect(screen.getByRole('link', { name: /Coast Guard El Nido weather advisory/ })).toHaveAttribute(
    'href',
    'https://www.facebook.com/cgs.elnido/',
  );
});

test('flight day details show the flight card, then arrival and layover on landing day', () => {
  render(<WeddingPage />);
  fireEvent.click(screen.getByRole('button', { name: 'Open Saturday, Nov 21' }));
  expect(screen.getByText('14h 40m in the air')).toBeInTheDocument();
  expect(screen.getByText('+2 days')).toBeInTheDocument();

  fireEvent.click(screen.getByRole('button', { name: 'Next day' }));
  fireEvent.click(screen.getByRole('button', { name: 'Next day' }));
  expect(screen.getByText(/Land in Taipei Taoyuan at 5:20 AM/)).toBeInTheDocument();
  expect(screen.getByText('2h 50m layover in Taipei Taoyuan')).toBeInTheDocument();
  expect(screen.getByText('CI 705')).toBeInTheDocument();
});

test('flights are tagged by traveler: us, mom with us, mom only', () => {
  render(<WeddingPage />);
  // Outbound: everyone
  fireEvent.click(screen.getByRole('button', { name: 'Open Saturday, Nov 21' }));
  expect(screen.getByText('Mom is on this flight with us')).toBeInTheDocument();
  fireEvent.keyDown(window, { key: 'Escape' });

  // Nov 24: everyone is on the same evening flight to El Nido
  fireEvent.click(screen.getByRole('button', { name: 'Open Tuesday, Nov 24' }));
  expect(screen.getByText('DG 6250')).toBeInTheDocument();
  expect(screen.getByText('Mom is on this flight with us')).toBeInTheDocument();
  fireEvent.keyDown(window, { key: 'Escape' });

  // Nov 28: mom flies back to Cebu alone; we stay another night
  fireEvent.click(screen.getByRole('button', { name: 'Open Saturday, Nov 28' }));
  expect(screen.getByText('DG 6255')).toBeInTheDocument();
  expect(screen.getAllByText('Mom only').length).toBeGreaterThan(1); // legend + flight badge
  expect(screen.getAllByText('Extra night in El Nido (Cassie & Andrew)').length).toBeGreaterThan(0); // overview card + detail
  fireEvent.keyDown(window, { key: 'Escape' });

  // Nov 29: our flight to Bohol
  fireEvent.click(screen.getByRole('button', { name: 'Open Sunday, Nov 29' }));
  expect(screen.getByText('DG 6887')).toBeInTheDocument();
  expect(screen.getByText('Andrew & Cassie')).toBeInTheDocument();
  fireEvent.keyDown(window, { key: 'Escape' });

  // Dec 5: our return via Taipei lands the same local day
  fireEvent.click(screen.getByRole('button', { name: 'Open Saturday, Dec 5' }));
  expect(screen.getByText('CI 706')).toBeInTheDocument();
  expect(screen.getByText('CI 8')).toBeInTheDocument();
  expect(screen.getByText('8h 55m layover in Taipei Taoyuan')).toBeInTheDocument();
  expect(screen.getAllByText('same day').length).toBe(2);
});

test('Bohol villa shows as a booking card and on its check-in and check-out days', () => {
  render(<WeddingPage />);
  // bookings strip
  expect(screen.getByText('LIME Resort Bohol')).toBeInTheDocument();
  expect(screen.getByText('73572374870256')).toBeInTheDocument();
  expect(screen.getAllByText(/Expedia itinerary/)).toHaveLength(2); // LIME + NUSTAR
  expect(screen.getAllByText('View itinerary ↗')).toHaveLength(2);

  // Nov 29: land in Bohol, then check in
  fireEvent.click(screen.getByRole('button', { name: 'Open Sunday, Nov 29' }));
  expect(screen.getByText('DG 6887')).toBeInTheDocument();
  expect(screen.getAllByText('Check in: LIME Resort Bohol').length).toBeGreaterThan(0); // overview card + detail
  expect(screen.getByText(/Check-in opens 3:00 PM; we land at TAG at 3:20 PM/)).toBeInTheDocument();
  expect(screen.queryByText(/Nothing booked after we land in Bohol/)).not.toBeInTheDocument();
  fireEvent.keyDown(window, { key: 'Escape' });

  // Dec 3: check out, then the ferry to Cebu; nothing is left to book
  fireEvent.click(screen.getByRole('button', { name: 'Open Thursday, Dec 3' }));
  expect(screen.getAllByText('Check out: LIME Resort Bohol').length).toBeGreaterThan(0);
  expect(screen.queryByText('Lodging Dec 3 – 5 & the way back to Cebu')).not.toBeInTheDocument();
  expect(screen.getAllByText(/Bohol → Cebu \(Oceanjet ferry\)/).length).toBeGreaterThan(1); // Dec 3 card + dialog header
  fireEvent.keyDown(window, { key: 'Escape' });
});

test('Oceanjet ferry and NUSTAR Cebu show as bookings and on Dec 3 and Dec 5', () => {
  render(<WeddingPage />);
  // bookings strip
  expect(screen.getByText('Oceanjet fast ferry')).toBeInTheDocument();
  expect(screen.getByText('B151223294')).toBeInTheDocument();
  expect(screen.getByText(/Ferryscanner booking/)).toBeInTheDocument();
  expect(screen.getByText(/Oceanjet code BW6029305/)).toBeInTheDocument();
  expect(screen.getByText('NUSTAR Hotel Cebu')).toBeInTheDocument();
  expect(screen.getByText('73574551404499')).toBeInTheDocument();
  expect(screen.getAllByText('View itinerary ↗')).toHaveLength(2); // LIME + NUSTAR

  // overview card: ferry line uses the boat icon and local time
  expect(screen.getByText('TAGBIL → CEB · 1:00 PM')).toBeInTheDocument();
  expect(screen.getByText('⛴')).toBeInTheDocument();

  // Dec 3: LIME check-out, ferry, NUSTAR check-in, in that order
  fireEvent.click(screen.getByRole('button', { name: 'Open Thursday, Dec 3' }));
  const dialog = screen.getByRole('dialog');
  expect(dialog).toHaveTextContent(/Check out: LIME Resort Bohol.*Oceanjet.*Check in: NUSTAR Hotel Cebu/);
  expect(screen.getByText('2h on the water')).toBeInTheDocument();
  expect(screen.getByText('Class Business')).toBeInTheDocument();
  expect(screen.getByText('Ferryscanner booking B151223294')).toBeInTheDocument();
  expect(screen.getByText('Tagbilaran Port, Bohol')).toBeInTheDocument();
  expect(screen.getByText('Cebu City Port')).toBeInTheDocument();
  expect(screen.getByText('Andrew & Cassie')).toBeInTheDocument();
  expect(screen.queryByText(/in the air/)).not.toBeInTheDocument();
  fireEvent.keyDown(window, { key: 'Escape' });

  // Dec 4: a full day in Cebu
  expect(screen.getAllByText('Cebu City (NUSTAR Hotel)').length).toBeGreaterThan(0);

  // Dec 5: check out of NUSTAR before the flight home
  fireEvent.click(screen.getByRole('button', { name: 'Open Saturday, Dec 5' }));
  expect(screen.getAllByText('Check out: NUSTAR Hotel Cebu').length).toBeGreaterThan(0);
  expect(screen.getByText('CI 706')).toBeInTheDocument();
  fireEvent.keyDown(window, { key: 'Escape' });
});

test('to-do panel is hidden for other signed-in users', () => {
  renderAs('someone.else@example.com');
  expect(screen.queryByRole('button', { name: /to-do list/i })).not.toBeInTheDocument();
});

test('to-do panel shows for Andrew, toggles, and adds items', async () => {
  renderAs('andrew.theiss@gmail.com');
  const toggle = screen.getByRole('button', { name: 'Show to-do list' });
  expect(toggle).toBeInTheDocument();

  // seeded defaults
  expect(screen.getByText('Ask Greg to give a speech')).toBeInTheDocument();
  expect(screen.getByText('Tell Byron to weave whatever speech he wants into the ceremony portion too')).toBeInTheDocument();

  fireEvent.click(toggle);
  expect(screen.getByRole('button', { name: 'Hide to-do list' })).toBeInTheDocument();

  const input = screen.getByLabelText('New to-do');
  fireEvent.change(input, { target: { value: 'Book El Nido → Cebu' } });
  await act(async () => {
    fireEvent.submit(input.closest('form'));
  });
  expect(screen.getByText('Book El Nido → Cebu')).toBeInTheDocument();
  expect(input.value).toBe('');

  // check it off
  const box = screen.getByLabelText('Book El Nido → Cebu');
  await act(async () => {
    fireEvent.click(box);
  });
  expect(box).toBeChecked();
});
