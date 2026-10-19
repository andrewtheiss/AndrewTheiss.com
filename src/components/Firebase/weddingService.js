import { doc, onSnapshot, serverTimestamp, setDoc } from 'firebase/firestore';
import { firestore } from './firebaseClient';

// One shared document for the whole wedding party's to-do list.
const todosRef = () => doc(firestore, 'weddingTodos', 'shared');

/** Live-subscribe to the to-do list. cb(items | null) — null means no doc yet. */
export const subscribeWeddingTodos = (cb, onError) =>
  onSnapshot(
    todosRef(),
    (snap) => cb(snap.exists() ? snap.data().items || [] : null),
    (err) => onError && onError(err),
  );

export const saveWeddingTodos = async (items, email) => {
  await setDoc(
    todosRef(),
    { items, updatedBy: email || null, updatedAt: serverTimestamp() },
    { merge: true },
  );
};
