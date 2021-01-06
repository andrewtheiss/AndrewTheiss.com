import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App.js';
import Chocolate from './chocolate/chocolate.js';
import reportWebVitals from './reportWebVitals';
import firebase from 'firebase/app';

var firebaseConfig = {
  apiKey: "AIzaSyDTeP-bHkPwE6QxfNpnaJu-F5oV5H7wRDU",
  authDomain: "advancedtopicscs.firebaseapp.com",
  databaseURL: "https://advancedtopicscs.firebaseio.com",
  projectId: "advancedtopicscs",
  storageBucket: "advancedtopicscs.appspot.com",
  messagingSenderId: "736168813101",
  appId: "1:736168813101:web:f014f2542e38d41bc7cea4",
  measurementId: "G-P7J0VHFL6B"
};

firebase.initializeApp(firebaseConfig);


ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
