import React from 'react';
import Firebase from 'firebase/app';
import config from "./config.js"
import Nav from './Nav.js';
import './App.css';

// Temp imports for testing
import Bean from './chocolate/bean.js'

class App extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    return (
    [
      <Nav  key="0" />,
      <div class="app-container">
        This is where the app is
        
      </div>
    ]
    );
  }
}

export default App;

// https://colorlib.com/wp/free-simple-website-templates/
