import React from 'react';
import { FirebaseContext } from '../../../Firebase';
import AddEditMoldSize from '../AddEdit.js'
import LookupSelection from '../../../Utils/LookupSelection.js'
import PreviewIntentions from '../Preview.js'
import '../Intention.css'


class IntentionMainPage extends React.Component {

  constructor(props) {
    super(props);
    this.onUpdateSelection = this.onUpdateSelection.bind(this);
    this.togglePageContentVisibilityDropdown = this.togglePageContentVisibilityDropdown.bind(this);

    this.state = {
      pageContentVisibilityDropdownToggled : false
    };
  }

  onUpdateSelection(seletedIntentionArray, seletedIntentionsData) {
    let seletedIntention = undefined;

    if (seletedIntentionArray && seletedIntentionArray.length > 0) {
      seletedIntention = seletedIntentionsData[seletedIntentionArray[0].value];
    }
    let state = {
      seletedIntentionSingle : seletedIntention,
      selectedIntentions : seletedIntentionArray,
      allIntentionData : seletedIntentionsData,
      pageContentVisibilityDropdownToggled : this.state.pageContentVisibilityDropdownToggled
    };
    this.setState(state);
  }


  togglePageContentVisibilityDropdown() {
    var pageContentVisibilityDropdownToggled = !this.state.pageContentVisibilityDropdownToggled;
    this.setState({pageContentVisibilityDropdownToggled});
  }

  render() {
    let previewIntentions = <PreviewIntentions intentions={this.state.selectedIntentions} />
    let showHideContent = (this.state.pageContentVisibilityDropdownToggled) ? "moldSizeMainPageContainer" : "moldSizeMainPageContainer hidden";
    let showHideCarat = (this.state.pageContentVisibilityDropdownToggled) ? "carat down" : "carat";
    return (
      <div className="moldSizePageOutterContainer">
        <span><span className={showHideCarat}></span><h2 className="moldSizeToggleDiv" onClick={this.togglePageContentVisibilityDropdown}>Intention</h2></span>
        <div className={showHideContent}>

          <FirebaseContext.Consumer>
            {firebase =>
              <AddEditMoldSize
                firebase={firebase}
                itemSelectedForEdit={this.state.selectedMoldSingle}
              />
            }
          </FirebaseContext.Consumer>
          <FirebaseContext.Consumer>
            {firebase =>
                <LookupSelection
                  firebase={firebase}
                  onUpdateSelection={this.onUpdateSelection}
                  collectionName="intention"
                  displayTitle="Intention"
                  allowMultiple={true}
                  sendDataOnUpdate={true}
                />
              }
          </FirebaseContext.Consumer>
          {previewIntentions}
        </div>
      </div>
    );
  }
}

export default IntentionMainPage;
