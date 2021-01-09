import firebase from 'firebase';
const prodConfig = {
  apiKey: "AIzaSyDTeP-bHkPwE6QxfNpnaJu-F5oV5H7wRDU",
  authDomain: "advancedtopicscs.firebaseapp.com",
  databaseURL: "https://advancedtopicscs.firebaseio.com",
  projectId: "advancedtopicscs",
  storageBucket: "advancedtopicscs.appspot.com",
  messagingSenderId: "736168813101",
  appId: "1:736168813101:web:f014f2542e38d41bc7cea4",
  measurementId: "G-P7J0VHFL6B"
};

const config = prodConfig;
  //process.env.NODE_ENV === 'production' ? prodConfig : devConfig;

class Firebase {
  constructor() {
    firebase.initializeApp(config);
    this.db = firebase.database();
  }
}

export default Firebase;
