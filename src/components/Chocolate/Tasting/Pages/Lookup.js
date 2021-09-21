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
    this.toggleQRCode = this.toggleQRCode.bind(this);

    this.setState({
      tastingId : null,
      showQRCode : false
    });
  }
  onUpdateSelection(selectionArray) {
    let tastingId = null;
    if (selectionArray.length > 0) {
      tastingId = selectionArray[0].value;
    }
    this.setState({tastingId});
  }
  toggleQRCode() {
    var showQRCode = true;
    if (this.state && this.state.showQRCode) {
        showQRCode = false;
    }
    this.setState({showQRCode});
  }
  render() {
    let tastingId = undefined;
    if (this.state && this.state.tastingId) {
      tastingId = this.state.tastingId;
    } else if (this.props.match && this.props.match.params && this.props.match.params.tastingId) {
      tastingId = this.props.match.params.tastingId;
    }
    var React = require('react');
    var QRCode = require('qrcode.react');
    var tastingUrl = window.location.origin + "/chocolate/tasting/" + tastingId;

    var qrCodeDivClass = 'qrhidden';
    if (this.state && this.state.showQRCode) {
      qrCodeDivClass = "qrshown";
    }
    var size = 1000;
    return (
      <div className="tastingPreviewContainer">

         <AuthUserContext.Consumer>
          {authUser =>
              authUser['admin'] ?
              <div className="tastingPreviewLeft"><FirebaseContext.Consumer>
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
              </FirebaseContext.Consumer>
              <button className="toggleQRCodeButton" onClick={this.toggleQRCode}>Toggle QR Code</button>
              <div  className={qrCodeDivClass} >
                <QRCode
                  value={tastingUrl}
                  renderAs="canvas"
                  size={size}
                  level="H"
                />
              </div>
              </div> : <div></div>
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
