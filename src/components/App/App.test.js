import { render, screen } from '@testing-library/react';
import App from './App';
import { FirebaseContext } from '../Firebase';
import { BrowserRouter as Router } from 'react-router-dom';
import React from 'react';

// Mock the splash page to avoid heavy Vanta/three setup in tests
jest.mock('../Splash/SplashPage', () => () => <div>Mock Splash</div>);

test('renders learn react link', () => {
  const mockFirebase = {
    onAuthStateChanged: () => () => { },
  };

  render(
    <FirebaseContext.Provider value={mockFirebase}>
      <Router>
        <App />
      </Router>
    </FirebaseContext.Provider>
  );

  const splashElement = screen.getByText(/mock splash/i);
  expect(splashElement).toBeInTheDocument();
});
