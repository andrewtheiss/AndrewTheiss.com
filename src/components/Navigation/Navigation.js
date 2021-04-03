import React from 'react';
import './Navigation.css';
import { Link } from 'react-router-dom'

import * as ROUTES from '../../constants/routes.js'
import SignOutButton from '../Session/SignOutButton.js';
import { AuthUserContext } from '../Session';
import { withAuthentication } from '../Session';

const Navigation = () => (
  <div className="navigation-side-bar-spacing">
  <header className="navigation-header">
    <div className="navigation-top-bar">
      <div id="logo">LOGO_HERE</div>
      <div id="navigation-wrap">Andrew Theiss</div>
      <div className="navigation-session">
      <AuthUserContext.Consumer>
      {authUser =>
          authUser['auth'] ? <NavigationLogout/> : <NavigationLogin />
        }
      </AuthUserContext.Consumer>
      </div>
    </div>
     <AuthUserContext.Consumer>
      {authUser =>
          authUser['admin'] ? <NavigationAdminAuth/> : <NavigationAnyAuth/>
        }
      </AuthUserContext.Consumer>
  </header>
  </div>
);

const NavigationLogin = () => (
  <button>
    <Link to={ROUTES.SIGNIN}>Sign In</Link>
  </button>
)
const NavigationLogout = () => (
  <SignOutButton />
)

const NavigationAnyAuth = () => (
  <ul className="navigation-side-bar">
  <li>
    <Link to={ROUTES.LANDING}>Home</Link>
  </li>
  <li>
    <Link to={ROUTES.SCRIPTS}>Scripts</Link>
  </li>
</ul>
);

const NavigationAdminAuth = () => (
  <ul className="navigation-side-bar">
    <li>
      <Link to={ROUTES.LANDING}>Home</Link>
    </li>
    <li>
      <Link to={ROUTES.SCRIPTS}>Scripts</Link>
    </li>
    <li>
      <Link to={ROUTES.INVENTORY}>Inventory</Link>
    </li>
  </ul>
);


export default Navigation;
