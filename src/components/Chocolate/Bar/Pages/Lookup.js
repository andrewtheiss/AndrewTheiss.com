import React from 'react';
import { FirebaseContext } from '../../../Firebase';

// Temp imports for testing
import BarLookup from '../Lookup.js'

class BarLookupPage extends React.Component {
  render() {
    console.log('bar lookup page');
    return (
        <FirebaseContext.Consumer>
          {firebase => <BarLookup firebase={firebase} />}
        </FirebaseContext.Consumer>
    );
  }
}

export default BarLookupPage;
