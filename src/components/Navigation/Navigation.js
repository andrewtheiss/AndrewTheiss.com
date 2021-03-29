import React from 'react';
import './Navigation.css';
import { Link } from 'react-router-dom'

import * as ROUTES from '../../constants/routes.js'

class Navigation extends React.Component {
  render() {
    return (
      <div className="navigation-side-bar-spacing">
      <header className="navigation-header">
        <div className="navigation-top-bar">
          <div id="logo">LOGO_HERE</div>
          <div id="navigation-wrap">Andrew Theiss</div>
        </div>

        <ul className="navigation-side-bar">
          <li>
            <Link to={ROUTES.LANDING}>Home</Link>
          </li>
          <li>
            <Link to={ROUTES.SCRIPTS}>Scripts</Link>
          </li>
        </ul>
      </header>
      <div>
      </div>
      </div>
    );
  }
}

export default Navigation;
