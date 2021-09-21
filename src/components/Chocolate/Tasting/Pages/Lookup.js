import React from 'react';
import { FirebaseContext } from '../../../Firebase';
import { AuthUserContext } from '../../../Session';
import TastingPreview from '../Preview/Preview.js'
import LookupSelection from '../../../Utils/LookupSelection.js'
import '../Tasting.css'


class TastingLookupPage extends React.Component {
  constructor(props) {
    super(props);
    this.onUpdateSelection = this.onUpdateSelection.bind(this);

    this.setState({
      tastingId : null
    })
  }
  onUpdateSelection(selectionArray) {
    let tastingId = null;
    if (selectionArray.length > 0) {
      tastingId = selectionArray[0].value;
    }
    this.setState({tastingId});
  }
  render() {
    let tastingId = undefined;
    if (this.state && this.state.tastingId) {
      tastingId = this.state.tastingId;
    } else if (this.props.match && this.props.match.params && this.props.match.params.tastingId) {
      tastingId = this.props.match.params.tastingId;
    }
    return (
      <div className="tastingPreviewContainer">

         <AuthUserContext.Consumer>
          {authUser =>
              authUser['admin'] ?
              <FirebaseContext.Consumer>
                {firebase =>
                    <LookupSelection
                      firebase={firebase}
                      onUpdateSelection={this.onUpdateSelection}
                      collectionName="tastingPublic"
                      displayTitle="Existing Tasting"
                      allowMultiple={true}
                      sendDataOnUpdate={true}
                    />
                  }
              </FirebaseContext.Consumer> : <div></div>
            }
          </AuthUserContext.Consumer>
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
