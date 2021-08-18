import React from 'react';
import { FirebaseContext } from '../../../Firebase';
import TastingPreview from '../Preview/Preview.js'
import '../Tasting.css'


class TastingLookupPage extends React.Component {
  render() {
    let tastingId = undefined;
    if (this.props.match && this.props.match.params && this.props.match.params.tastingId) {
      tastingId = this.props.match.params.tastingId;
    }
    return (
      <div class="tastingPreviewContainer">
      <FirebaseContext.Consumer>
          {firebase =>
            <TastingPreview
              firebase={firebase}
              tastingId={tastingId}
            />
          }
      </FirebaseContext.Consumer>
        </div>
    );
  }
}

export default TastingLookupPage;
