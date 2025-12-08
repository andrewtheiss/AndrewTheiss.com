import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const requiredKeys = [
  'REACT_APP_FIREBASE_API_KEY',
  'REACT_APP_FIREBASE_AUTH_DOMAIN',
  'REACT_APP_FIREBASE_PROJECT_ID',
  'REACT_APP_FIREBASE_STORAGE_BUCKET',
  'REACT_APP_FIREBASE_MESSAGING_SENDER_ID',
  'REACT_APP_FIREBASE_APP_ID',
];

const readConfig = (prefix) => ({
  apiKey: process.env[`${prefix}API_KEY`],
  authDomain: process.env[`${prefix}AUTH_DOMAIN`],
  databaseURL: process.env[`${prefix}DATABASE_URL`],
  projectId: process.env[`${prefix}PROJECT_ID`],
  storageBucket: process.env[`${prefix}STORAGE_BUCKET`],
  messagingSenderId: process.env[`${prefix}MESSAGING_SENDER_ID`],
  appId: process.env[`${prefix}APP_ID`],
  measurementId: process.env[`${prefix}MEASUREMENT_ID`],
});

const ensureApp = (config, name) => {
  const existing = name ? getApps().find((app) => app.name === name) : getApps()[0];
  if (existing) return existing;
  return name ? initializeApp(config, name) : initializeApp(config);
};

const hasAllPrimaryKeys = requiredKeys.every((key) => Boolean(process.env[key]));
if (!hasAllPrimaryKeys) {
  const missingKeys = requiredKeys.filter((key) => !process.env[key]);
  throw new Error(
    `Missing Firebase environment variables: ${missingKeys.join(
      ', ',
    )}. Add them to your .env file.`,
  );
}

const firebaseConfig = readConfig('REACT_APP_FIREBASE_');
const app = ensureApp(firebaseConfig);
const auth = getAuth(app);
const firestore = getFirestore(app);
const storage = getStorage(app);

enableIndexedDbPersistence(firestore).catch(() => {
  // ignore persistence errors (unsupported or multiple tabs)
});

const secondaryConfig = readConfig('REACT_APP_SECONDARY_FIREBASE_');
const hasSecondaryConfig = Object.values(secondaryConfig).some(Boolean);
const secondaryApp = hasSecondaryConfig ? ensureApp(secondaryConfig, 'secondary') : null;
const secondaryAuth = secondaryApp ? getAuth(secondaryApp) : null;
const secondaryFirestore = secondaryApp ? getFirestore(secondaryApp) : null;
const secondaryStorage = secondaryApp ? getStorage(secondaryApp) : null;

export {
  app,
  auth,
  firestore,
  storage,
  firebaseConfig,
  secondaryApp,
  secondaryAuth,
  secondaryFirestore,
  secondaryStorage,
};
