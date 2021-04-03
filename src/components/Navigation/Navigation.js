import React from 'react';
import './Navigation.css';
import { Link } from 'react-router-dom'

import * as ROUTES from '../../constants/routes.js'
import SignOutButton from '../Session/SignOutButton.js';

const Navigation = ({authUser, adminUser}) => (
   <NavigationMenu adminUser={adminUser} authUser={authUser}/>
);

class NavigationMenu extends React.Component {
  constructor(props) {
    super(props);
  }
  signUpButton() {
    if (this.props.authUser) {
      return ('')
    }
    return(
      <li>
        <Link to={ROUTES.SIGNUP}>Sign Up</Link>
      </li>
    );
  }
  render() {
    const isAuthorized = this.props.authUser;
    let additionalLinks;
    let logInOutButton;
    let signUpButton = this.signUpButton();
    if (this.props.adminUser) {
      additionalLinks = <li><Link to={ROUTES.INVENTORY}>Inventory</Link></li>;
    }
    if (isAuthorized) {
      logInOutButton =
      <li>
        <SignOutButton />
      </li>;
    } else {
      logInOutButton = <button><Link to={ROUTES.SIGNIN}>Sign In</Link></button>;
    }

    return (
      <div className="navigation-side-bar-spacing">
      <header className="navigation-header">
        <div className="navigation-top-bar">
          <div id="logo">LOGO_HERE</div>
          <div id="navigation-wrap">Andrew Theiss</div>
          <div className="navigation-session">{logInOutButton}</div>
        </div>

        <ul className="navigation-side-bar">
          <li>
            <Link to={ROUTES.LANDING}>Home</Link>
          </li>
          <li>
            <Link to={ROUTES.SCRIPTS}>Scripts</Link>
          </li>
          {signUpButton}
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
