import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  setDoc,
  where,
} from 'firebase/firestore';
import { firestore } from './firebaseClient';

const meditationCollection = collection(firestore, 'meditations');
const counterCollection = collection(firestore, 'meditationCounters');
const monthlyTotalsCollection = collection(firestore, 'meditationMonthlyTotals');

const formatDuration = (totalSeconds) => {
  const safeTotal = Math.max(1, Math.round(Number(totalSeconds) || 0));
  const hours = Math.floor(safeTotal / 3600);
  const minutes = Math.floor((safeTotal % 3600) / 60);
  const seconds = safeTotal % 60;
  const pad = (num) => String(num).padStart(2, '0');
  return `${hours}:${pad(minutes)}:${pad(seconds)}`;
};

const formatDateKey = (date) => {
  const d = date instanceof Date ? date : new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const reserveMeditationId = async (startedAt) => {
  const keyDate = startedAt ? new Date(startedAt) : new Date();
  const dateKey = formatDateKey(keyDate);
  const counterRef = doc(counterCollection, dateKey);

  const id = await runTransaction(firestore, async (tx) => {
    const snap = await tx.get(counterRef);
    const current = snap.exists() ? snap.data().count || 0 : 0;

    if (current >= 1000) {
      throw new Error('Daily meditation limit reached (1000).');
    }

    const next = current + 1;
    tx.set(
      counterRef,
      {
        count: next,
        updatedAt: serverTimestamp(),
      },
      { merge: true },
    );

    const padded = String(next).padStart(3, '0');
    return `${dateKey}-${padded}`;
  });

  return { id, dateKey };
};

export const addMeditationEntry = async ({
  uid,
  startedAt,
  durationSeconds,
  preset,
  activity = 'Meditation',
}) => {
  const safeSeconds = Math.max(1, Math.round(Number(durationSeconds) || 0));
  const startValue = startedAt instanceof Date ? startedAt : (startedAt ? new Date(startedAt) : null);
  const { id } = await reserveMeditationId(startValue);

  const ref = doc(meditationCollection, id);
  await setDoc(ref, {
    uid,
    startedAt: startValue || serverTimestamp(),
    dateKey: formatDateKey(startValue || new Date()),
    durationSeconds: safeSeconds,
    duration: formatDuration(safeSeconds),
    preset: preset || '',
    activity,
    createdAt: serverTimestamp(),
  });

  return { id, ref };
};

export const getMeditationCounter = async (date) => {
  const dateKey = formatDateKey(date || new Date());
  const ref = doc(counterCollection, dateKey);
  const snap = await getDoc(ref);
  const count = snap.exists() ? snap.data().count || 0 : 0;
  return {
    dateKey,
    count,
    nextId: `${dateKey}-${String(Math.min(count + 1, 1000)).padStart(3, '0')}`,
    isLimitReached: count >= 1000,
  };
};

const getUserMeditations = async (uid) => {
  const q = query(
    meditationCollection,
    where('uid', '==', uid),
    orderBy('startedAt', 'desc'),
    limit(5000),
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((docSnap) => ({
    id: docSnap.id,
    ...docSnap.data(),
  }));
};

const formatMonthKey = (date) => {
  const d = date instanceof Date ? new Date(date) : new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`; // YYYY-MM
};

const getMonthFromYearMonth = (monthKey) => {
  const [yearRaw, monthRaw] = String(monthKey || '').split('-');
  const year = Number(yearRaw);
  const month = Number(monthRaw);
  if (!Number.isFinite(year) || !Number.isFinite(month) || month < 1 || month > 12) return null;
  return { year, month };
};

const addMonths = (year, month, delta) => {
  const base = new Date(Date.UTC(year, month - 1, 1));
  base.setUTCMonth(base.getUTCMonth() + delta);
  return { year: base.getUTCFullYear(), month: base.getUTCMonth() + 1 };
};

const monthToKey = (year, month) => `${year}-${String(month).padStart(2, '0')}`;

const normalizeStartedAtToDate = (value) => {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (value?.toDate) return value.toDate();
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
};

export const updateMonthlyTotals = async (uid) => {
  if (!uid) throw new Error('Missing uid for totals update.');
  const sessions = await getUserMeditations(uid);

  // Reverse to roughly chronological insertion (oldest -> newest)
  const chronological = [...sessions].reverse();

  const buckets = new Map();
  chronological.forEach((session) => {
    const ts = session.startedAt?.toDate ? session.startedAt.toDate() : session.startedAt;
    const date = ts instanceof Date ? ts : new Date();
    const monthKey = formatMonthKey(date);
    const durationSeconds = Number(session.durationSeconds || 0);
    const safeDuration = Number.isFinite(durationSeconds) ? Math.max(0, Math.round(durationSeconds)) : 0;

    const prev = buckets.get(monthKey) || { durations: [], totalSeconds: 0 };
    buckets.set(monthKey, {
      durations: [...prev.durations, safeDuration],
      totalSeconds: prev.totalSeconds + safeDuration,
    });
  });

  let writes = 0;
  for (const [monthKey, data] of buckets.entries()) {
    const ref = doc(monthlyTotalsCollection, monthKey);
    await setDoc(
      ref,
      {
        uid,
        month: monthKey,
        durationsSeconds: data.durations,
        totalDurationSeconds: Math.round(data.totalSeconds),
        sessionCount: data.durations.length,
        updatedAt: serverTimestamp(),
      },
      { merge: true },
    );
    writes += 1;
  }

  return { monthsUpdated: writes, sessionsProcessed: sessions.length };
};

export const recalculateMonthlyTotalsForMonth = async (uid, monthKey) => {
  if (!uid) throw new Error('Missing uid for totals update.');
  const parsed = getMonthFromYearMonth(monthKey);
  if (!parsed) throw new Error('Invalid month key.');

  const next = addMonths(parsed.year, parsed.month, 1);
  const startKey = `${monthToKey(parsed.year, parsed.month)}-01`;
  const endKeyExclusive = `${monthToKey(next.year, next.month)}-01`;

  let sessions = [];
  try {
    const q = query(
      meditationCollection,
      where('uid', '==', uid),
      where('dateKey', '>=', startKey),
      where('dateKey', '<', endKeyExclusive),
    );
    const snapshot = await getDocs(q);
    sessions = snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }));
  } catch (err) {
    // If the project doesn't have the needed composite index yet, fall back to client-side filtering.
    const all = await getUserMeditations(uid);
    sessions = all.filter((session) => {
      const dt = normalizeStartedAtToDate(session.startedAt);
      if (!dt) return false;
      return formatMonthKey(dt) === monthKey;
    });
  }

  const durations = sessions.map((session) => {
    const durationSeconds = Number(session.durationSeconds || 0);
    return Number.isFinite(durationSeconds) ? Math.max(0, Math.round(durationSeconds)) : 0;
  });
  const totalSeconds = durations.reduce((sum, v) => sum + v, 0);

  const ref = doc(monthlyTotalsCollection, monthKey);
  await setDoc(
    ref,
    {
      uid,
      month: monthKey,
      durationsSeconds: durations,
      totalDurationSeconds: Math.round(totalSeconds),
      sessionCount: durations.length,
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );

  return { monthKey, sessionsProcessed: sessions.length, totalDurationSeconds: Math.round(totalSeconds) };
};

export const recalculateMonthlyTotalsForLastMeditation = async (uid) => {
  if (!uid) throw new Error('Missing uid for totals update.');

  let lastStartedAt = null;
  try {
    const q = query(
      meditationCollection,
      where('uid', '==', uid),
      orderBy('startedAt', 'desc'),
      limit(1),
    );
    const snapshot = await getDocs(q);
    const docSnap = snapshot.docs[0];
    if (!docSnap) return { monthKey: null, sessionsProcessed: 0, totalDurationSeconds: 0 };
    lastStartedAt = normalizeStartedAtToDate(docSnap.data()?.startedAt);
  } catch (err) {
    const all = await getUserMeditations(uid);
    lastStartedAt = normalizeStartedAtToDate(all[0]?.startedAt);
  }

  if (!lastStartedAt) return { monthKey: null, sessionsProcessed: 0, totalDurationSeconds: 0 };
  const monthKey = formatMonthKey(lastStartedAt);
  return await recalculateMonthlyTotalsForMonth(uid, monthKey);
};

export const recalculateMonthlyTotalsForLastNMonths = async (uid, monthsCount = 1) => {
  if (!uid) throw new Error('Missing uid for totals update.');
  const n = Math.max(1, Math.min(60, Math.floor(Number(monthsCount) || 1)));

  let lastStartedAt = null;
  try {
    const q = query(
      meditationCollection,
      where('uid', '==', uid),
      orderBy('startedAt', 'desc'),
      limit(1),
    );
    const snapshot = await getDocs(q);
    const docSnap = snapshot.docs[0];
    if (!docSnap) return { months: [], sessionsProcessed: 0 };
    lastStartedAt = normalizeStartedAtToDate(docSnap.data()?.startedAt);
  } catch (err) {
    const all = await getUserMeditations(uid);
    lastStartedAt = normalizeStartedAtToDate(all[0]?.startedAt);
  }

  if (!lastStartedAt) return { months: [], sessionsProcessed: 0 };

  const lastMonthKey = formatMonthKey(lastStartedAt);
  const parsed = getMonthFromYearMonth(lastMonthKey);
  if (!parsed) return { months: [], sessionsProcessed: 0 };

  const results = [];
  let totalSessions = 0;
  for (let i = 0; i < n; i += 1) {
    const target = addMonths(parsed.year, parsed.month, -i);
    const monthKey = monthToKey(target.year, target.month);
    // eslint-disable-next-line no-await-in-loop
    const res = await recalculateMonthlyTotalsForMonth(uid, monthKey);
    results.push(res);
    totalSessions += Number(res?.sessionsProcessed || 0);
  }

  return { months: results, sessionsProcessed: totalSessions };
};

export const listRecentMeditations = async (max = 30, uid = null) => {
  const q = query(
    meditationCollection,
    ...(uid ? [where('uid', '==', uid)] : []),
    orderBy('startedAt', 'desc'),
    limit(max),
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((docSnap) => ({
    id: docSnap.id,
    ...docSnap.data(),
  }));
};

export const listMonthlyTotals = async (maxMonths = 36, uid = null) => {
  const q = query(
    monthlyTotalsCollection,
    ...(uid ? [where('uid', '==', uid)] : []),
    orderBy('month', 'desc'),
    limit(maxMonths),
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((docSnap) => ({
    id: docSnap.id,
    ...docSnap.data(),
  }));
};



