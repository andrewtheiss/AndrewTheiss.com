import firebase from 'firebase/app';
import 'firebase/firestore';
import "firebase/auth";
import 'firebase/storage';

const prodConfig = {
    apiKey: "AIzaSyCCmfrwzGLalOs4iEdep6FHw6VMranrjXY",
    authDomain: "andrewtheiss-6336c.firebaseapp.com",
    databaseURL: "https://andrewtheiss-6336c.firebaseio.com",
    projectId: "andrewtheiss-6336c",
    storageBucket: "andrewtheiss-6336c.appspot.com",
    messagingSenderId: "300886092746",
    appId: "1:300886092746:web:8ad9128065ef7ff22e7d33"
};

const chocolateConfig = {
    apiKey: "AIzaSyCvYVGRkPANXQrs0bGKOMgKHylFkJ6MaAE",
    authDomain: "chocolate-party.firebaseapp.com",
    projectId: "chocolate-party",
    storageBucket: "chocolate-party.appspot.com",
    messagingSenderId: "878396758642",
    appId: "1:878396758642:web:e2727d2b1f6ebb68d4c0eb",
    measurementId: "G-Y7LGFTXYVY",
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
    this.writeOnlyChocolateApp = firebase.initializeApp(chocolateConfig, 'chocolateApp');
    this.writeOnlyChocolateDb = firebase.firestore(this.writeOnlyChocolateApp);

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

  async uploadFile(file, container, filename) {
    const storageRef = this.storage.ref();
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

  doSignOut = () => this.auth.signOut();

  doPasswordReset = email => this.auth.sendPasswordResetEmail(email);

  doPasswordUpdate = password =>
    this.auth.currentUser.updatePassword(password);
}

export default Firebase;
