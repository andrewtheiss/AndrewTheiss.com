import React from 'react';
import { FirebaseContext } from '../../../Firebase';
import AddEditBar from '../AddEdit/Main.js'


class BarAddEditPage extends React.Component {
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

export default BarAddEditPage;
