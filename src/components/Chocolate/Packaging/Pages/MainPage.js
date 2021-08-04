import React from 'react';
import { FirebaseContext } from '../../../Firebase';
import AddEditPackaging from '../AddEdit.js'
import LookupSelection from '../../../Utils/LookupSelection.js'
import PreviewItem from '../../../Utils/PreviewItem.js'
import '../Packaging.css'


class PackagingMainPage extends React.Component {

  constructor(props) {
    super(props);
    this.onUpdateSelection = this.onUpdateSelection.bind(this);
    this.generatePreviewForSelections = this.generatePreviewForSelections.bind(this);
    this.togglePageContentVisibilityDropdown = this.togglePageContentVisibilityDropdown.bind(this);

    this.state = {
      selectedPackaging : null,
      selectedPackagings : null,
      allPackagingData : null,
      pageContentVisibilityDropdownToggled : true
    }
  }

  onUpdateSelection(selectedPackagingArray, packagingData) {
    let selectedPackaging = undefined;

    if (selectedPackagingArray && selectedPackagingArray.length > 0) {
      selectedPackaging = packagingData[selectedPackagingArray[0].value];
    }
    let state = {
      selectedPackaging : selectedPackaging,
      selectedPackagings : selectedPackagingArray,
      allPackagingData : packagingData,
      pageContentVisibilityDropdownToggled : this.state.pageContentVisibilityDropdownToggled
    };
    this.setState(state);
  }

  generatePreviewForSelections() {
    let preview = '';

    if (this.state.allPackagingData && this.state.selectedPackagings && this.state.selectedPackagings.length) {
      preview = Object.keys(this.state.selectedPackagings).map((key) => (
        <PreviewItem mold={this.state.allPackagingData[this.state.selectedPackagings[key].value]} key={key} data-id={key} onMouseEnter={this.handleMouseOver} onClick={this.handleClick} />
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
    let showHideContent = (this.state.pageContentVisibilityDropdownToggled) ? "packagingMainPageContainer" : "packagingMainPageContainer hidden";
    let showHideCarat = (this.state.pageContentVisibilityDropdownToggled) ? "carat down" : "carat";
    return (
      <div className="packagingPageOutterContainer">
        <span><span className={showHideCarat}></span><h2 className="packagingToggleDiv" onClick={this.togglePageContentVisibilityDropdown}>Toggle Packaging Panel</h2></span>
        <div className={showHideContent}>

          <FirebaseContext.Consumer>
            {firebase =>
              <AddEditPackaging
                firebase={firebase}
                itemSelectedForEdit={this.state.selectedPackaging}
              />
            }
          </FirebaseContext.Consumer>
          {previewMolds}
        </div>
      </div>
    );
  }
}

export default PackagingMainPage;

/*

ADD BACK IN

<FirebaseContext.Consumer>
  {firebase =>
      <LookupSelection
        firebase={firebase}
        onUpdateSelection={this.onUpdateSelection}
        collectionName="moldSize"
        displayTitle="Packaging Wrap"
        allowMultiple={true}
        sendDataOnUpdate={true}
      />
    }
</FirebaseContext.Consumer>
<FirebaseContext.Consumer>
  {firebase =>
      <LookupSelection
        firebase={firebase}
        onUpdateSelection={this.onUpdateSelection}
        collectionName="moldSize"
        displayTitle="Packaging Overwrap"
        allowMultiple={true}
        sendDataOnUpdate={true}
      />
    }
</FirebaseContext.Consumer>
<FirebaseContext.Consumer>
  {firebase =>
      <LookupSelection
        firebase={firebase}
        onUpdateSelection={this.onUpdateSelection}
        collectionName="moldSize"
        displayTitle="Packaging Label"
        allowMultiple={true}
        sendDataOnUpdate={true}
      />
    }
</FirebaseContext.Consumer>
*/
