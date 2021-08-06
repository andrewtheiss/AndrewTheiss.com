import React from 'react';
import { FirebaseContext } from '../../../Firebase';
import AddEditIntention from '../AddEdit.js'
import LookupSelection from '../../../Utils/LookupSelection.js'
import PreviewIntentions from '../Preview.js'
import '../Intention.css'


class IntentionMainPage extends React.Component {

  constructor(props) {
    super(props);
    this.onUpdateSelection = this.onUpdateSelection.bind(this);
    this.togglePageContentVisibilityDropdown = this.togglePageContentVisibilityDropdown.bind(this);

    this.state = {
      selectedIntentionSingle : null,
      selectedIntentions : null,
      allIntentionData : null,
      pageContentVisibilityDropdownToggled : false
    };
  }

  onUpdateSelection(selectedIntentionArray, selectedIntentionsData) {
    let selectedIntention = undefined;

    if (selectedIntentionArray && selectedIntentionArray.length > 0) {
      selectedIntention = selectedIntentionsData[selectedIntentionArray[0].value];
    }
    let state = {
      selectedIntentionSingle : selectedIntention,
      selectedIntentions : selectedIntentionArray,
      allIntentionData : selectedIntentionsData,
      pageContentVisibilityDropdownToggled : this.state.pageContentVisibilityDropdownToggled
    };
    this.setState(state);
  }


  togglePageContentVisibilityDropdown() {
    var pageContentVisibilityDropdownToggled = !this.state.pageContentVisibilityDropdownToggled;
    this.setState({pageContentVisibilityDropdownToggled});
  }

  render() {

    // Render without loading all data if we don't ever toggle visibility
    if (!this.state.pageContentVisibilityDropdownToggled)  {
      return (
        <div className="moldSizePageOutterContainer">
          <span><span className="carat"></span><h2 className="commonToggleDiv" onClick={this.togglePageContentVisibilityDropdown}>Intention</h2></span>
          <div className="moldSizeMainPageContainer hidden">
          </div>
        </div>
      );
    }

    let previewIntentions = <PreviewIntentions intentions={this.state.selectedIntentions} />
    let showHideContent = (this.state.pageContentVisibilityDropdownToggled) ? "moldSizeMainPageContainer" : "moldSizeMainPageContainer hidden";
    let showHideCarat = (this.state.pageContentVisibilityDropdownToggled) ? "carat down" : "carat";
    return (
      <div className="moldSizePageOutterContainer">
        <span><span className={showHideCarat}></span><h2 className="commonToggleDiv" onClick={this.togglePageContentVisibilityDropdown}>Intention</h2></span>
        <div className={showHideContent}>

          <FirebaseContext.Consumer>
            {firebase =>
              <AddEditIntention
                firebase={firebase}
                itemSelectedForEdit={this.state.selectedIntentionSingle}
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
