import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './components/App/App.js';
import Firebase, { FirebaseContext } from './components/Firebase';

const container = document.getElementById('root');
const root = createRoot(container);
root.render(
  <React.StrictMode>
    <FirebaseContext.Provider value={new Firebase()}>
      <App />
    </FirebaseContext.Provider>
  </React.StrictMode>
);
