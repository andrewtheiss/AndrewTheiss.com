import React from 'react';
import { Link } from 'react-router-dom';
import { AuthUserContext } from '../Session';
import * as ROUTES from '../../constants/routes';
import './MainPage.css';

const MeditationMainPage = () => {
  console.log('[Meditation] render');
  return (
    <AuthUserContext.Consumer>
      {authUser => (
        <div className="meditation-page">
          <div className="meditation-card">
            <p className="eyebrow">Meditation</p>
            <h1>Coming soon</h1>
            {!authUser?.auth && (
              <p className="body">
                Sign in to start tracking sessions.{' '}
                <Link to={ROUTES.SIGNIN} className="meditation-link">Go to sign in</Link>
              </p>
            )}
            {authUser?.auth && (
              <p className="body">
                You’re signed in. Session logging will appear here when ready.
              </p>
            )}
          </div>
        </div>
      )}
    </AuthUserContext.Consumer>
  );
};

export default MeditationMainPage;
