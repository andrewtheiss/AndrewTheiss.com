import React from 'react';
import Nav from '../Nav/Nav.js';
import './App.css';
import  { FirebaseContext } from '../Firebase';

// Temp imports for testing
import Bean from '../Chocolate/Bean/Bean.js'
import Chocolate from '../Chocolate/Chocolate/Chocolate.js'

class App extends React.Component {
  render() {
    return (
    [
      <Nav  key="0" />,
      <div key="1" className="app-container">
        <FirebaseContext.Consumer>
          {firebase => <Chocolate firebase={firebase} />}
        </FirebaseContext.Consumer>

      </div>,
      <div key="2" className="app-container">
        <FirebaseContext.Consumer>
          {firebase => <Bean firebase={firebase} />}
        </FirebaseContext.Consumer>

      </div>
    ]
    );
  }
}

export default App;

// https://colorlib.com/wp/free-simple-website-templates/
// https://www.robinwieruch.de/complete-firebase-authentication-react-tutorial
