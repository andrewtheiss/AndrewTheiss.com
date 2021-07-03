import React from 'react';
import  { FirebaseContext } from '../../Firebase';

// Temp imports for testing
import Bean from '../Bean/Bean.js'
import Chocolate from '../Chocolate/Chocolate.js'
import BarLookupSelection from '../Bar/LookupSelection.js'

class ChocolatePageTest extends React.Component {
  render() {
    return (
    [
      <div key="1" className="chocolate-container">
        <FirebaseContext.Consumer>
          {firebase => <Chocolate firebase={firebase} />}
        </FirebaseContext.Consumer>

      </div>,
      <div key="2" className="chocolate-container">
        <FirebaseContext.Consumer>
          {firebase => <Bean firebase={firebase} />}
        </FirebaseContext.Consumer>
      </div>,
      <div key="3" className="chocolate-container">
        <FirebaseContext.Consumer>
          {firebase => <BarLookupSelection firebase={firebase} />}
        </FirebaseContext.Consumer>
      </div>
    ]
    );
  }
}

export default ChocolatePageTest;
