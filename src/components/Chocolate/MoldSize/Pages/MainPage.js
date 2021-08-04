import React from 'react';
import { FirebaseContext } from '../../../Firebase';
import AddEditMoldSize from '../AddEdit.js'
import LookupSelection from '../../../Utils/LookupSelection.js'
import PreviewMoldSize from '../Preview.js'
import '../MoldSize.css'


class MoldSizeMainPage extends React.Component {

  constructor(props) {
    super(props);
    this.onUpdateSelection = this.onUpdateSelection.bind(this);
    this.generatePreviewForSelections = this.generatePreviewForSelections.bind(this);
    this.togglePageContentVisibilityDropdown = this.togglePageContentVisibilityDropdown.bind(this);

    this.state = {
      selectedMoldSingle : null,
      selectedMolds : null,
      allMoldData : null,
      pageContentVisibilityDropdownToggled : false
    }
  }

  onUpdateSelection(selectedMoldArray, moldsData) {
    let selectedMold = undefined;

    if (selectedMoldArray && selectedMoldArray.length > 0) {
      selectedMold = moldsData[selectedMoldArray[0].value];
    }
    let state = {
      selectedMoldSingle : selectedMold,
      selectedMolds : selectedMoldArray,
      allMoldData : moldsData,
      pageContentVisibilityDropdownToggled : this.state.pageContentVisibilityDropdownToggled
    };
    this.setState(state);
  }

  generatePreviewForSelections() {
    let preview = '';

    if (this.state.allMoldData && this.state.selectedMolds && this.state.selectedMolds.length) {
      preview = Object.keys(this.state.selectedMolds).map((key) => (
        <PreviewMoldSize mold={this.state.allMoldData[this.state.selectedMolds[key].value]} key={key} data-id={key} onMouseEnter={this.handleMouseOver} onClick={this.handleClick} />
      ));
    }
    return preview;
  }

  togglePageContentVisibilityDropdown() {
    var pageContentVisibilityDropdownToggled = !this.state.pageContentVisibilityDropdownToggled;
    this.setState({pageContentVisibilityDropdownToggled});
  }

  render() {
    let previewMolds = this.generatePreviewForSelections();
    let showHideContent = (this.state.pageContentVisibilityDropdownToggled) ? "moldSizeMainPageContainer" : "moldSizeMainPageContainer hidden";
    let showHideCarat = (this.state.pageContentVisibilityDropdownToggled) ? "carat down" : "carat";
    return (
      <div className="moldSizePageOutterContainer">
        <span><span className={showHideCarat}></span><h2 className="moldSizeToggleDiv" onClick={this.togglePageContentVisibilityDropdown}>Toggle Bar Mold/Size Modification Panel</h2></span>
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
                  collectionName="moldSize"
                  displayTitle="Bar Mold / Sizes"
                  allowMultiple={true}
                  sendDataOnUpdate={true}
                />
              }
          </FirebaseContext.Consumer>
          {previewMolds}
        </div>
      </div>
    );
  }
}

export default MoldSizeMainPage;
