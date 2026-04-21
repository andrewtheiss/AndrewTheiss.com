const DB_NAME = 'strudel-samples';
const DB_VERSION = 1;
const STORE = 'blobs';

let dbPromise = null;

const openDB = () => {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  return dbPromise;
};

const tx = async (mode, fn) => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const t = db.transaction(STORE, mode);
    const store = t.objectStore(STORE);
    let result;
    Promise.resolve(fn(store)).then((r) => { result = r; }).catch(reject);
    t.oncomplete = () => resolve(result);
    t.onerror = () => reject(t.error);
    t.onabort = () => reject(t.error);
  });
};

const reqToPromise = (req) => new Promise((resolve, reject) => {
  req.onsuccess = () => resolve(req.result);
  req.onerror = () => reject(req.error);
});

export const putSample = (path, blob) =>
  tx('readwrite', (store) => reqToPromise(store.put(blob, path)));

export const getSample = (path) =>
  tx('readonly', (store) => reqToPromise(store.get(path)));

export const hasSample = async (path) => {
  const blob = await getSample(path);
  return blob instanceof Blob;
};

export const getAllPaths = () =>
  tx('readonly', (store) => reqToPromise(store.getAllKeys()));

export const getAllEntries = () =>
  tx('readonly', (store) => Promise.all([
    reqToPromise(store.getAllKeys()),
    reqToPromise(store.getAll()),
  ]).then(([keys, values]) => keys.map((k, i) => [k, values[i]])));

export const clearAll = () =>
  tx('readwrite', (store) => reqToPromise(store.clear()));
