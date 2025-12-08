import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updatePassword,
  onAuthStateChanged,
  useDeviceLanguage as setAuthDeviceLanguage,
} from 'firebase/auth';
import {
  addDoc,
  collection as fsCollection,
  deleteDoc,
  doc,
  documentId,
  getDoc,
  getDocs,
  query as fsQuery,
  setDoc,
  updateDoc,
  where as fsWhere,
} from 'firebase/firestore';
import {
  ref,
  uploadBytes,
  getDownloadURL,
} from 'firebase/storage';
import {
  app,
  auth,
  firestore,
  storage,
} from './firebaseClient';

const buildDocWrapper = (docRef) => ({
  ref: docRef,
  id: docRef.id,
  get: () => getDoc(docRef),
  set: (data, options) => setDoc(docRef, data, options),
  update: (data) => updateDoc(docRef, data),
  delete: () => deleteDoc(docRef),
});

const buildQueryWrapper = (queryRef) => ({
  ref: queryRef,
  get: () => getDocs(queryRef),
  where: (...args) => buildQueryWrapper(fsQuery(queryRef, fsWhere(...args))),
});

const buildCollectionWrapper = (colRef) => ({
  ref: colRef,
  get: () => getDocs(colRef),
  add: (data) => addDoc(colRef, data),
  doc: (id) => buildDocWrapper(id ? doc(colRef, id) : doc(colRef)),
  where: (...args) => buildQueryWrapper(fsQuery(colRef, fsWhere(...args))),
});

const buildFirestoreCompat = (dbInstance) => ({
  collection: (path) => buildCollectionWrapper(fsCollection(dbInstance, path)),
  FieldPath: { documentId },
  _raw: dbInstance,
});

class Firebase {
  constructor() {
    this.app = app;
    this.db = buildFirestoreCompat(firestore);
    this.storage = storage;
    this.auth = auth;
    this.firebase = {
      auth: { GoogleAuthProvider },
      firestore: { FieldPath: { documentId } },
    };

    this.auth.signInWithPopup = (provider) => signInWithPopup(this.auth, provider);
    this.auth.signInWithEmailAndPassword = (email, password) =>
      signInWithEmailAndPassword(this.auth, email, password);
    this.auth.createUserWithEmailAndPassword = (email, password) =>
      createUserWithEmailAndPassword(this.auth, email, password);
    this.auth.useDeviceLanguage = () => {
      try {
        return setAuthDeviceLanguage(this.auth);
      } catch (err) {
        this.auth.languageCode = navigator.language;
        return this.auth.languageCode;
      }
    };
  }

  async uploadFile(file, container, filename) {
    const storageRef = ref(this.storage, `${container}/${filename}`);
    await uploadBytes(storageRef, file);
  }

  async getFileUrl(container, filename) {
    const storageRef = ref(this.storage, `${container}/${filename}`);
    return getDownloadURL(storageRef);
  }

  onAuthStateChanged(callback) {
    return onAuthStateChanged(this.auth, callback);
  }

  doCreateUserWithEmailAndPassword = (email, password) =>
    createUserWithEmailAndPassword(this.auth, email, password);

  doSignInWithEmailAndPassword = (email, password) =>
    signInWithEmailAndPassword(this.auth, email, password);

  doGoogleSignIn = () => {
    const provider = new GoogleAuthProvider();
    provider.addScope('email');
    return signInWithPopup(this.auth, provider);
  };

  doGoogleRedirect = () => {
    const provider = new GoogleAuthProvider();
    provider.addScope('email');
    return signInWithRedirect(this.auth, provider);
  };

  handleRedirectResult = () => getRedirectResult(this.auth);

  doSignOut = () => {
    signOut(this.auth);
    window.location.href = '/';
  };

  doPasswordReset = (email) => sendPasswordResetEmail(this.auth, email);

  doPasswordUpdate = (password) =>
    this.auth.currentUser ? updatePassword(this.auth.currentUser, password) : Promise.reject(new Error('No authenticated user'));
}

export default Firebase;
