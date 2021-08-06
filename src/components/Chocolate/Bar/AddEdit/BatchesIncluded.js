import React from 'react';
import * as CONSTS from '../constants.js'
import { FirebaseContext } from '../../../Firebase';
import LookupSelection from '../../../Utils/LookupSelection.js'
import BatchIncludedForm from './BatchIncludedForm.js'


/**
 *  BatchesIncluded
 *
 *  Props:
 *  batchesPctIncluded      : Bar state batchesPctIncluded
 *  onUpdate                : Method to parent updating batchesPctIncluded
 *
 */
class BatchesIncluded extends React.Component {
  constructor(props) {
    super(props);
    this.generateRenderPctInputByBatchSelection = this.generateRenderPctInputByBatchSelection.bind(this);
    this.formatBatchesSelectionFromProps = this.formatBatchesSelectionFromProps.bind(this);
    this.onUpdateBatchSelection = this.onUpdateBatchSelection.bind(this);
    this.onUpdateBatchPct = this.onUpdateBatchPct.bind(this);
    this.updateParent = this.updateParent.bind(this);

    this.state = {
      batchesPctIncluded : this.props.batchesPctIncluded,
      batchesSelected : this.formatBatchesSelectionFromProps()
    }
  }

  formatBatchesSelectionFromProps() {
    let formattedBatchSelection = [];
    Object.keys(this.props.batchesPctIncluded).forEach(function(key) {
      formattedBatchSelection.push({label : key, value : key});
    })
    return formattedBatchSelection;
  }

  componentDidUpdate(prevProps) {
    let isEdit = this.props.itemSelectedForEdit;

    // Only do something if there's a change in the batchToEdit
    if (this.props !== prevProps) {

      // If there's something to edit or the props don't match the default
      if (isEdit) {

        // Save the selected label we selected for edit
        if (this.props.itemSelectedForEdit) {
          this.setState({
            batchesPctIncluded : this.props.batchesPctIncluded,
            batchesSelected : this.formatBatchesSelectionFromProps()
          });
        }
      } else {
        this.setState(CONSTS.BATCHES_DEFAULT_PCT_INCLUDED);
      }
    }
  }


  updateParent() {
    this.props.onUpdate(this.state.batchesPctIncluded);
  }

  /**
   *  onUpdateBatchSelection
   *    Recreates the list based only on selected values
   *
   *  Usage:
   *  - Default is a single selection auto set to 100% of the batch used
   *  - Unrelated to which bar molds are used (can use one mixed batch into a bunch of molds)
   *
   *  Note:
   *  We may want to support 25% of one batch and 75% of another mixed in the same
   */
  async onUpdateBatchSelection(batchesSelection) {
    let batchesPctIncluded = {};
    for (var i in batchesSelection) {
      let key = batchesSelection[i].label;
      let value = 100;
      if (this.state.batchesPctIncluded[key]) {
        value = this.state.batchesPctIncluded[key];
      }
      batchesPctIncluded[key] = value;
    }

    await this.setState({
      'batchesPctIncluded' : batchesPctIncluded,
      'batchesSelected' : batchesSelection
    });

    this.updateParent();
  }

  async onUpdateBatchPct(id, newPct) {
    let batchesPctIncluded = this.state.batchesPctIncluded;
    batchesPctIncluded[id] = newPct;
    await this.setState({batchesPctIncluded});
    this.updateParent();
  }

  generateRenderPctInputByBatchSelection() {
    let self = this;
    let pctInputByBatchSelection = Object.keys(this.state.batchesPctIncluded).map((key) => (
           <BatchIncludedForm label={key} value={self.state.batchesPctIncluded[key]} onUpdateBatchPct={self.onUpdateBatchPct} key={key} />
       ));
    return pctInputByBatchSelection;
  }

  render() {
    let pctInputByBatchSelection = this.generateRenderPctInputByBatchSelection();
    return (
      <div className="barBatchSelection">
        <div>
         <b>Batch + Amount Poured Into Bar</b>
          <div className="barBatchSelectionPctInputs">
            {pctInputByBatchSelection}
          </div>
        </div>
        <FirebaseContext.Consumer>
          {firebase =>
              <LookupSelection
                firebase={firebase}
                onUpdateSelection={this.onUpdateBatchSelection}
                collectionName="batchesPublic"
                displayTitle="Batches Public"
                allowMultiple={true}
                sendDataOnUpdate={true}
                selectedData={this.state.batchesSelected}
              />
            }
        </FirebaseContext.Consumer>
      </div>
    );
  }
}

export default BatchesIncluded;
