import Firebase from 'firebase/app';
const config = {
  apiKey: "AIzaSyDTeP-bHkPwE6QxfNpnaJu-F5oV5H7wRDU",
  authDomain: "advancedtopicscs.firebaseapp.com",
  databaseURL: "https://advancedtopicscs.firebaseio.com",
  projectId: "advancedtopicscs",
  storageBucket: "advancedtopicscs.appspot.com",
  messagingSenderId: "736168813101",
  appId: "1:736168813101:web:f014f2542e38d41bc7cea4",
  measurementId: "G-P7J0VHFL6B"
};

Firebase.initializeApp(config);
export default Firebase;
