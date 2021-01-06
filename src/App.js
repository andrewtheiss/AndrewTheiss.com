import logo from './logo.svg';
import React from 'react';
import Nav from './Nav.js';
import './App.css';

class App extends React.Component {
  render() {
    return (
    [<Nav  key="0" />,
      <div class="app-container">
        This is where the app is
      </div>
    ]
    );
  }
}

export default App;
