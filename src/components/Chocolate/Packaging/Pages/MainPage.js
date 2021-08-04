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

    this.state = {
      selectedMoldSingle : null,
      selectedMolds : null,
      allMoldData : null
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
      allMoldData : moldsData
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

  render() {
    let previewMolds = this.generatePreviewForSelections();
    return (
      <div className="moldSizeMainPageContainer">

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
    );
  }
}

export default MoldSizeMainPage;
