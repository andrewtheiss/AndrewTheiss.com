import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore';
import { firestore } from './firebaseClient';

const getEquityDocRef = (uid) => doc(firestore, 'equityProfiles', uid);

export const getEquityProfile = async (uid) => {
  const snap = await getDoc(getEquityDocRef(uid));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
};

export const saveEquityProfile = async (uid, data) => {
  await setDoc(
    getEquityDocRef(uid),
    { ...data, uid, updatedAt: serverTimestamp() },
    { merge: true },
  );
};
