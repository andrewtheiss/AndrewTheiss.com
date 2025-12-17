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

export const listRecentMeditations = async (max = 30) => {
  const q = query(
    meditationCollection,
    orderBy('startedAt', 'desc'),
    limit(max),
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((docSnap) => ({
    id: docSnap.id,
    ...docSnap.data(),
  }));
};

export const listMonthlyTotals = async (maxMonths = 36) => {
  const q = query(
    monthlyTotalsCollection,
    orderBy('month', 'desc'),
    limit(maxMonths),
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((docSnap) => ({
    id: docSnap.id,
    ...docSnap.data(),
  }));
};



