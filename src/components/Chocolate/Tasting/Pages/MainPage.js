import React from 'react';
import { FirebaseContext } from '../../../Firebase';
import AddEditTasting from '../AddEdit.js'
import LookupSelection from '../../../Utils/LookupSelection.js'
import PreviewTasting from '../Preview.js'
import '../Tasting.css'


class TastingMainPage extends React.Component {

  constructor(props) {
    super(props);
    this.onUpdateSelection = this.onUpdateSelection.bind(this);
    this.togglePageContentVisibilityDropdown = this.togglePageContentVisibilityDropdown.bind(this);

    this.state = {
      selectedTastingSingle : null,
      selectedTastings : null,
      allTastingData : null,
      pageContentVisibilityDropdownToggled : false
    };
  }

  onUpdateSelection(selectedTastingArray, selectedTastingsData) {
    let selectedTasting = undefined;

    if (selectedTastingArray && selectedTastingArray.length > 0) {
      selectedTasting = selectedTastingsData[selectedTastingArray[0].value];
    }
    let state = {
      selectedTastingSingle : selectedTasting,
      selectedTastings : selectedTastingArray,
      allTastingData : selectedTastingsData,
      pageContentVisibilityDropdownToggled : this.state.pageContentVisibilityDropdownToggled
    };
    this.setState(state);
  }


  togglePageContentVisibilityDropdown() {
    var pageContentVisibilityDropdownToggled = !this.state.pageContentVisibilityDropdownToggled;
    this.setState({pageContentVisibilityDropdownToggled});
  }

  render() {
    let previewTasting = <PreviewTasting state={this.state.selectedTastingSingle} />
    let showHideContent = (this.state.pageContentVisibilityDropdownToggled) ? "tastingMainPageContainer" : "tastingMainPageContainer hidden";
    let showHideCarat = (this.state.pageContentVisibilityDropdownToggled) ? "carat down" : "carat";
    return (
      <div className="tastingPageOutterContainer">
        <span><span className={showHideCarat}></span><h2 className="commonToggleDiv" onClick={this.togglePageContentVisibilityDropdown}>Tasting</h2></span>
        <div className={showHideContent}>

          <FirebaseContext.Consumer>
            {firebase =>
              <AddEditTasting
                firebase={firebase}
                itemSelectedForEdit={this.state.selectedTastingSingle}
              />
            }
          </FirebaseContext.Consumer>
          <FirebaseContext.Consumer>
            {firebase =>
                <LookupSelection
                  firebase={firebase}
                  onUpdateSelection={this.onUpdateSelection}
                  collectionName="tasting"
                  displayTitle="Tasting"
                  allowMultiple={true}
                  sendDataOnUpdate={true}
                />
              }
          </FirebaseContext.Consumer>
          {previewTasting}
        </div>
      </div>
    );
  }
}

export default TastingMainPage;
