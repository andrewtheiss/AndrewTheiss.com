import React from 'react';
import  { FirebaseContext } from '../../../Firebase';

// Temp imports for testing
import Bean from '../Bean.js'
import Chocolate from '../../Batch/Chocolate.js'

class BeanLookupPage extends React.Component {
  render() {
    return (
      <div key="1" className="chocolate-container">
        <FirebaseContext.Consumer>
          {firebase => <Chocolate firebase={firebase} />}
        </FirebaseContext.Consumer>
        <FirebaseContext.Consumer>
          {firebase => <Bean firebase={firebase} />}
        </FirebaseContext.Consumer>
      </div>
    );
  }
}

export default BeanLookupPage;
