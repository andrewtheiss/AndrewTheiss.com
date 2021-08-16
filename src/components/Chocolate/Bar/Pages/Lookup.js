import React from 'react';
import { FirebaseContext } from '../../../Firebase';
import BarPreview from '../Preview.js'


class BarLookupPage extends React.Component {
  render() {
    let barId = undefined;
    console.log('bar lookup', this.props);
    if (this.props.match && this.props.match.params && this.props.match.params.barId) {
      barId = this.props.match.params.barId;
    }
    return (
      <div>
        <FirebaseContext.Consumer>
          {firebase => <BarPreview barId={barId} firebase={firebase} />}
        </FirebaseContext.Consumer>
        </div>
    );
  }
}

export default BarLookupPage;
