import React from 'react';
import { FirebaseContext } from '../../../Firebase';
import AddEditBar from '../AddEdit.js'


class BarLookupPage extends React.Component {
  render() {
    return (
      <div>



        <FirebaseContext.Consumer>
          {firebase => <AddEditBar firebase={firebase} />}
        </FirebaseContext.Consumer>

        </div>
    );
  }
}

export default BarLookupPage;


/*

        <FirebaseContext.Consumer>
          {firebase => <BarLookup firebase={firebase} />}
        </FirebaseContext.Consumer>

    */
