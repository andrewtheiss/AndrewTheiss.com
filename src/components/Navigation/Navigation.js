import React from 'react';
import './Navigation.css';
import { Link } from 'react-router-dom'
import * as Session from './Session.js'

import * as ROUTES from '../../constants/routes.js'

class Navigation extends React.Component {
  constructor(props) {
    super(props);
    //this.handleLoginClick = this.handleLoginClick.bind(this);
    //this.handleLogoutClick = this.handleLogoutClick.bind(this);
    this.state = {isLoggedIn: false};
  }
  handleLoginClick() {

  }
  handleLogoutClick() {

  }
  render() {
    const isLoggedIn = this.state.isLoggedIn;
    let additionalLinks;
    let logInOutButton;
    if (isLoggedIn) {
      additionalLinks = <li><Link to={ROUTES.INVENTORY}>Inventory</Link></li>;
    }
    if (isLoggedIn) {
      logInOutButton = <button><Link to={ROUTES.SIGNOUT}>Sign Out</Link></button>;
    } else {
      logInOutButton = <button><Link to={ROUTES.SIGNIN}>Sign In</Link></button>;
    }

    return (
      <div className="navigation-side-bar-spacing">
      <header className="navigation-header">
        <div className="navigation-top-bar">
          <div id="logo">LOGO_HERE</div>
          <div id="navigation-wrap">Andrew Theiss</div>
          <div class="navigation-session">{logInOutButton}</div>
        </div>

        <ul className="navigation-side-bar">
          <li>
            <Link to={ROUTES.LANDING}>Home</Link>
          </li>
          <li>
            <Link to={ROUTES.SCRIPTS}>Scripts</Link>
          </li>
          {additionalLinks}
        </ul>
      </header>
      <div>
      </div>
      </div>
    );
  }
}

export default Navigation;
