import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import { firestore } from './firebaseClient';

const usageCollection = collection(firestore, 'usageEntries');

export const addUsageEntry = async ({ uid, category, value, note, occurredAt }) => {
  return addDoc(usageCollection, {
    uid,
    category,
    value,
    note: note || '',
    occurredAt: occurredAt || serverTimestamp(),
    createdAt: serverTimestamp(),
  });
};

export const listUsageEntries = async ({ uid, max = 50 }) => {
  const q = query(
    usageCollection,
    where('uid', '==', uid),
    orderBy('occurredAt', 'desc'),
    limit(max),
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((snap) => ({
    id: snap.id,
    ...snap.data(),
  }));
};

export const updateUsageEntry = async (id, data) => {
  const ref = doc(usageCollection, id);
  await updateDoc(ref, data);
};

export const deleteUsageEntry = async (id) => {
  const ref = doc(usageCollection, id);
  await deleteDoc(ref);
};
