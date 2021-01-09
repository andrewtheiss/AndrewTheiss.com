import React from 'react';
import './Nav.css';

class Nav extends React.Component {
  render() {
    return (
      <header>
        <div class="nav-header">
          <div id="logo"></div>
          <div id="navigation-wrap"></div>
        </div>
      </header>
    );
  }
}

export default Nav;
