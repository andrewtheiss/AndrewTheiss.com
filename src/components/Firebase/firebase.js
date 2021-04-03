import firebase from 'firebase/app';
import 'firebase/firestore';
import "firebase/auth";

const prodConfig = {
    apiKey: "AIzaSyCCmfrwzGLalOs4iEdep6FHw6VMranrjXY",
    authDomain: "andrewtheiss-6336c.firebaseapp.com",
    databaseURL: "https://andrewtheiss-6336c.firebaseio.com",
    projectId: "andrewtheiss-6336c",
    storageBucket: "andrewtheiss-6336c.appspot.com",
    messagingSenderId: "300886092746",
    appId: "1:300886092746:web:8ad9128065ef7ff22e7d33"
};

const config = prodConfig;
  //process.env.NODE_ENV === 'production' ? prodConfig : devConfig;

class Firebase {
  constructor() {
    this.app = firebase.initializeApp(config);
    this.db = firebase.firestore();
    this.auth = firebase.auth();
    this.firebase = firebase;
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
