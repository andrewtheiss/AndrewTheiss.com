import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  where,
} from 'firebase/firestore';
import { firestore } from './firebaseClient';

const soundsCollection = collection(firestore, 'sounds');
const gameObjectsCollection = collection(firestore, 'gameObjects');
const bindingsCollection = collection(firestore, 'gameBindings');

const stripUndefined = (obj) => {
  const out = {};
  Object.entries(obj).forEach(([k, v]) => {
    if (v !== undefined) out[k] = v;
  });
  return out;
};

// ---------- sounds ----------

export const listSounds = async (uid) => {
  const q = query(soundsCollection, where('ownerId', '==', uid));
  const snap = await getDocs(q);
  const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  items.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
  return items;
};

export const getSound = async (id) => {
  const snap = await getDoc(doc(soundsCollection, id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
};

export const saveSound = async (uid, sound) => {
  const id = sound.id || doc(soundsCollection).id;
  const ref = doc(soundsCollection, id);
  const existing = sound.id ? await getDoc(ref) : null;
  const isNew = !existing || !existing.exists();
  await setDoc(
    ref,
    stripUndefined({
      ownerId: uid,
      name: sound.name || 'Untitled',
      code: sound.code || '',
      mode: sound.mode || 'oneShot',
      oneShotMs: sound.oneShotMs ?? 600,
      tags: sound.tags || [],
      createdAt: isNew ? serverTimestamp() : existing.data().createdAt,
      updatedAt: serverTimestamp(),
    }),
    { merge: true },
  );
  return id;
};

export const deleteSound = async (id) => {
  await deleteDoc(doc(soundsCollection, id));
};

// ---------- gameObjects ----------

export const listGameObjects = async (uid) => {
  const q = query(gameObjectsCollection, where('ownerId', '==', uid));
  const snap = await getDocs(q);
  const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  items.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
  return items;
};

export const saveGameObject = async (uid, obj) => {
  const id = obj.id || doc(gameObjectsCollection).id;
  const ref = doc(gameObjectsCollection, id);
  const existing = obj.id ? await getDoc(ref) : null;
  const isNew = !existing || !existing.exists();
  await setDoc(
    ref,
    stripUndefined({
      ownerId: uid,
      name: obj.name || 'Untitled',
      kind: obj.kind || 'event',
      events: obj.events || {},
      config: obj.config || {},
      createdAt: isNew ? serverTimestamp() : existing.data().createdAt,
      updatedAt: serverTimestamp(),
    }),
    { merge: true },
  );
  return id;
};

export const deleteGameObject = async (id) => {
  await deleteDoc(doc(gameObjectsCollection, id));
};

// ---------- bindings (one doc per user) ----------

export const ENGINE_SLOTS = [
  { key: 'preStartAmbient', label: 'Pre-start ambient', mode: 'loop' },
  { key: 'playStart', label: 'Play pressed', mode: 'oneShot' },
  { key: 'bgLoop', label: 'Background loop', mode: 'loop' },
  { key: 'playerShoot', label: 'Player shoot', mode: 'oneShot' },
  { key: 'bulletExpire', label: 'Bullet expire', mode: 'oneShot' },
];

export const getBindings = async (uid) => {
  const snap = await getDoc(doc(bindingsCollection, uid));
  if (!snap.exists()) return { slots: {} };
  return snap.data();
};

// Full overwrite so removed slot keys actually disappear. Firestore's
// `merge: true` does a deep merge of nested maps, which would preserve
// keys we tried to delete locally.
export const saveBindings = async (uid, slots) => {
  const cleanSlots = {};
  Object.entries(slots || {}).forEach(([k, v]) => {
    if (v) cleanSlots[k] = v;
  });
  await setDoc(doc(bindingsCollection, uid), {
    ownerId: uid,
    slots: cleanSlots,
    updatedAt: serverTimestamp(),
  });
};
