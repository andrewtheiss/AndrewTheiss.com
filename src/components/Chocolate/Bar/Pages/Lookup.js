import React from 'react';
import { FirebaseContext } from '../../../Firebase';
import MoldSizeMainPage from '../../MoldSize/Pages/MainPage.js'

// Temp imports for testing
import BarLookup from '../Lookup.js'

class BarLookupPage extends React.Component {
  render() {
    console.log('bar lookup page');
    return (
      <div>
        <FirebaseContext.Consumer>
          {firebase => <BarLookup firebase={firebase} />}
        </FirebaseContext.Consumer>


        <FirebaseContext.Consumer>
          {firebase => <MoldSizeMainPage firebase={firebase} />}
        </FirebaseContext.Consumer>
        </div>
    );
  }
}

export default BarLookupPage;
