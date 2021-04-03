import React, {useState} from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './components/App/App.js';
import Firebase, { FirebaseContext } from './components/Firebase';
import Session, { SessionContext } from './components/Session';

ReactDOM.render(
  <React.StrictMode>
    <FirebaseContext.Provider value={new Firebase()}>
      <SessionContext.Provider value={SessionContext}>
      <App />
     </SessionContext.Provider>
    </FirebaseContext.Provider>
  </React.StrictMode>,
  document.getElementById('root')
);
