import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import 'firebase/compat/auth';
import 'firebase/compat/storage';

const prodConfig = {
    apiKey: "AIzaSyCCmfrwzGLalOs4iEdep6FHw6VMranrjXY",
    authDomain: "andrewtheiss-6336c.firebaseapp.com",
    databaseURL: "https://andrewtheiss-6336c.firebaseio.com",
    projectId: "andrewtheiss-6336c",
    storageBucket: "andrewtheiss-6336c.appspot.com",
    messagingSenderId: "300886092746",
    appId: "1:300886092746:web:8ad9128065ef7ff22e7d33"
};

const cConfig = {
    apiKey: atob('QUl6YVN5Q3ZZVkdSa1BBTlhRcnMwYkdLT01nS0h5bEZrSjZNYUFF'),
    authDomain: atob('Y2hvY29sYXRlLXBhcnR5LmZpcmViYXNlYXBwLmNvbQ=='),
    projectId: atob('Y2hvY29sYXRlLXBhcnR5'),
    storageBucket: atob('Y2hvY29sYXRlLXBhcnR5LmFwcHNwb3QuY29t'),
    messagingSenderId: atob('ODc4Mzk2NzU4NjQy'),
    appId: atob('MTo4NzgzOTY3NTg2NDI6d2ViOmUyNzI3ZDJiMWY2ZWJiNjhkNGMwZWI='),
    measurementId: atob('Ry1ZN0xHRlRYWVZZ'),
  };


const config = prodConfig;
  //process.env.NODE_ENV === 'production' ? prodConfig : devConfig;

class Firebase {
  constructor() {
    this.app = firebase.initializeApp(config);
    this.db = firebase.firestore();
    this.firebase = firebase;
    this.storage = firebase.storage();

    // Create read-only db access for other db url
    this.writeOnlyChocolateApp = firebase.initializeApp(cConfig, 'chocolateApp');
    this.writeOnlyChocolateDb = firebase.firestore(this.writeOnlyChocolateApp);
    this.writeOnlyChocolateStorage = firebase.storage(this.writeOnlyChocolateApp);
    this.writeOnlyChocolateAuth = firebase.auth(this.writeOnlyChocolateApp);

    this.auth = firebase.auth();
    // Enable persistence
    firebase.firestore().settings({
        cacheSizeBytes: firebase.firestore.CACHE_SIZE_UNLIMITED,
        merge: true
    });
    firebase.firestore().enablePersistence().catch((err) => {
      if (err.code === 'failed-precondition') {
          // Multiple tabs open, persistence can only be enabled
          // in one tab at a a time.
          // ...
      } else if (err.code === 'unimplemented') {
          // The current browser does not support all of the
          // features required to enable persistence
          // ...
      }

    });
    //firebase.firestore().disableNetwork();
  }

  async uploadFile(file, container, filename, writeToChocolateStorage = false) {
    let storageRef = this.storage.ref();
    if (writeToChocolateStorage) {
      storageRef = this.writeOnlyChocolateStorage.ref();
    }
    const refLocation = container + '/' + filename;
    const fileRef = storageRef.child(refLocation);
    // 'file' comes from the Blob or File API
    await fileRef.put(file).then((snapshot) => {
      console.log('Uploaded a blob or file to' + refLocation);
    });
  }

  async getFileUrl(container, filename) {
    const storageRef = this.storage.ref();
    const refLocation = container + '/' + filename;
    let url = await storageRef.child(refLocation).getDownloadURL()
    return url;
  }

  // *** Auth API ***
  doCreateUserWithEmailAndPassword = (email, password) =>
    this.auth.createUserWithEmailAndPassword(email, password);

  doSignInWithEmailAndPassword = (email, password) =>
    this.auth.signInWithEmailAndPassword(email, password);

  doSignOut = () => {
    this.auth.signOut();
    window.location.href = '/';
  };

  doPasswordReset = email => this.auth.sendPasswordResetEmail(email);

  doPasswordUpdate = password =>
    this.auth.currentUser.updatePassword(password);
}

export default Firebase;
