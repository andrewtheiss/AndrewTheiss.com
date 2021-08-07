import React from 'react';
import * as CONSTS from '../constants.js'
import { FirebaseContext } from '../../../Firebase';
import MoldSelectionItemDetails from './MoldSelectionItemDetails.js'
import LookupSelection from '../../../Utils/LookupSelection.js'

/**
 *  MoldSelection
 *
 *  Props:
 *  barMoldDetails     : Bar barMoldDetails
 *  onUpdate           : Method to parent updating barsFromMolds
 *
 */
class MoldSelection extends React.Component {
  constructor(props) {
    super(props);
    this.formatMoldsSelected = this.formatMoldsSelected.bind(this);
    this.updateParent = this.updateParent.bind(this);
    this.generateRenderPerBarMoldSelection = this.generateRenderPerBarMoldSelection.bind(this);
    this.updateBarMoldSelection = this.updateBarMoldSelection.bind(this);

    // If something is selected for edit, override views
    this.editSelectionInUse = false;

    this.state = {
      barMoldDetails : this.props.barMoldDetails,
      barMoldsSelected : this.formatMoldsSelected()
    }
  }

  formatMoldsSelected() {
    let formattedMoldSelection = [];
    Object.keys(this.props.barMoldDetails).forEach(function(key) {
      formattedMoldSelection.push({label : key, value : key});
    })
    return formattedMoldSelection;
  }

  // If batchesPctIncluded prop changes, we need to recalculate everything
  componentDidUpdate(prevProps) {

    // Only do something if there's a change in the batchToEdit
    if (this.props !== prevProps) {
      let isEdit = this.props.itemSelectedForEdit;
      this.editSelectionInUse = false;

      // If there's something to edit or the props don't match the default
      if (isEdit) {

        // Save the selected label we selected for edit
        /*
        this.editSelectionInUse = true;
        if (this.props.itemSelectedForEdit) {
          this.setState({
            batchesPctIncluded : this.props.batchesPctIncluded,
            batchesSelected : this.formatBatchesSelected()
          });
        }
        */

      }
      else if (
        this.props.batchesPctIncluded !== prevProps.batchesPctIncluded ||
        this.props.recalculateMolds
      ) {

        // Recalculate individual bar/mold selection
        console.log('recalculate bar mold selection');
      }

    } // End check if props are same
  }


  updateParent() {
    this.props.onUpdate(this.state.barMoldDetails);
  }

  onUpdateBarMoldDetails() {

  }

  generateRenderPerBarMoldSelection() {
    let self = this;
    let barMoldDetails = Object.keys(this.state.barMoldDetails).map((key) => (
          <MoldSelectionItemDetails
           label={key}
           value={self.state.barMoldDetails[key]}
           onUpdateBarMoldDetails={self.onUpdateBarMoldDetails}
           key={key}
         />
       ));
    return barMoldDetails;
  }

  updateBarMoldSelection(moldSelection, moldData) {
    console.log(moldSelection);
    let prevBarMoldDetails = this.state.barMoldDetails;
    let barMoldDetails = {};
    let self = this;
    for (var i in moldSelection) {
      if (prevBarMoldDetails[moldSelection[i].label]) {
        barMoldDetails[moldSelection[i].label] = prevBarMoldDetails[moldSelection[i].label];
      } else {
        barMoldDetails[moldSelection[i].label] = CONSTS.BAR_FROM_MOLD_DETAILS;
      }
    }
    this.setState({barMoldDetails});
  }

  render() {
    let barMoldDetails = this.generateRenderPerBarMoldSelection();

    return (
      <div className="barBatchSelection">
        <div>
         <b>Bar Selection and Details</b>
         <FirebaseContext.Consumer>
           {firebase =>
             <LookupSelection
               firebase={firebase}
               onUpdateSelection={this.updateBarMoldSelection}
               collectionName="moldSize"
               displayTitle="Bar Molds"
               allowMultiple={true}
               sendDataOnUpdate={true}
               />
             }
         </FirebaseContext.Consumer>
          <div className="barBatchSelectionPctInputs">
            {barMoldDetails}
          </div>
        </div>
      </div>
    );
  }
}

export default MoldSelection;
