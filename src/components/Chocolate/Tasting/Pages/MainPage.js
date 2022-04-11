import React from 'react';
import { FirebaseContext } from '../../../Firebase';
import AddEditTasting from '../AddEdit.js'
import LookupSelection from '../../../Utils/LookupSelection.js'
import TastingPreview from '../Preview/Preview.js'
import '../Tasting.css'


class TastingMainPage extends React.Component {

  constructor(props) {
    super(props);
    this.onUpdateSelection = this.onUpdateSelection.bind(this);
    this.togglePageContentVisibilityDropdown = this.togglePageContentVisibilityDropdown.bind(this);
    this.onUpdateTasting = this.onUpdateTasting.bind(this);

    this.state = {
      selectedTastingSingle : null,
      selectedTastings : null,
      allTastingData : null,
      pageContentVisibilityDropdownToggled : true,
      latestTastingState : {}
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
    console.log(state, this.state);
    this.setState(state);
  }


  togglePageContentVisibilityDropdown() {
    var pageContentVisibilityDropdownToggled = !this.state.pageContentVisibilityDropdownToggled;
    this.setState({pageContentVisibilityDropdownToggled});
  }

  onUpdateTasting(state) {
    let latestTastingState = state;
    this.setState({latestTastingState});
  }

  render() {
    // Render without loading all data if we don't ever toggle visibility
    if (!this.state.pageContentVisibilityDropdownToggled)  {
      return (
        <div className="tastingPageOutterContainer">
          <span><span className="carat"></span><h2 className="commonToggleDiv" onClick={this.togglePageContentVisibilityDropdown}>Tasting</h2></span>
          <div className="tastingMainPageContainer hidden">
          </div>
        </div>
      );
    }
console.log(this.state.latestTastingState);
    let showHideContent = (this.state.pageContentVisibilityDropdownToggled) ? "tastingMainPageContainer" : "tastingMainPageContainer hidden";
    let showHideCarat = (this.state.pageContentVisibilityDropdownToggled) ? "carat down" : "carat";
    return (
      <div className="tastingPageOutterContainer">
        <span><span className={showHideCarat}></span><h2 className="commonToggleDiv" onClick={this.togglePageContentVisibilityDropdown}>Tasting</h2></span>
        <div className={showHideContent}>
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
        </FirebaseContext.Consumer>
        <br />
        <br />
        <br />

          <FirebaseContext.Consumer>
            {firebase =>
              <AddEditTasting
                firebase={firebase}
                itemSelectedForEdit={this.state.selectedTastingSingle}
                onUpdate={this.onUpdateTasting}
              />
            }
          </FirebaseContext.Consumer>
          <br />
          <div className="tastingAddEditPreview">
          <FirebaseContext.Consumer>
              {firebase =>
                <TastingPreview
                  firebase={firebase}
                  tasting={this.state.latestTastingState}
                />
              }
          </FirebaseContext.Consumer>
          </div>
        </div>
      </div>
    );
  }
}

export default TastingMainPage;
