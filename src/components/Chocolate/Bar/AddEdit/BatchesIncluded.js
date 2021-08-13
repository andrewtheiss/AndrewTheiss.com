import React from 'react';
import { FirebaseContext } from '../../../Firebase';
import LookupSelection from '../../../Utils/LookupSelection.js'
import BatchIncludedForm from './BatchIncludedForm.js'


/**
 *  BatchesIncluded
 *
 *  Props:
 *  batchesIncludedPct      : Bar state batchesIncludedPct
 *  onUpdate                : Method to parent updating batchesIncludedPct
 *
 */
class BatchesIncluded extends React.Component {
  constructor(props) {
    super(props);
    this.generateRenderPctInputByBatchSelection = this.generateRenderPctInputByBatchSelection.bind(this);
    this.formatBatchesSelected = this.formatBatchesSelected.bind(this);
    this.onUpdateBatchSelection = this.onUpdateBatchSelection.bind(this);
    this.onUpdateBatchPct = this.onUpdateBatchPct.bind(this);
    this.updateParent = this.updateParent.bind(this);
    this.updateBatchData = this.updateBatchData.bind(this);

    // Used to override LookupSelection selected details
    this.batchesSelectedInUse = false;
    this.batchData = false;


    this.state = {
      batchesIncludedPct : this.props.batchesIncluded.pct,
      batchesIncludedCost : this.props.batchesIncluded.cost,
      batchesIncludedTotalWeightInGrams : this.props.batchesIncluded.totalWeightInGrams,
      batchesIncludedTotalCost : this.props.batchesIncluded.totalCost,
      batchesSelected : this.formatBatchesSelected()
    }
  }

  formatBatchesSelected(batchesIncluded) {
    let batchesToConvert = this.props.batchesIncluded.pct;
    if (batchesIncluded) {
      batchesToConvert = batchesIncluded;
    }
    let formattedBatchSelection = [];
    Object.keys(batchesToConvert).forEach(function(key) {
      formattedBatchSelection.push({label : key, value : key});
    })
    return formattedBatchSelection;
  }

  componentDidUpdate(prevProps) {
    let isEdit = this.props.itemSelectedForEdit;

    // Only do something if there's a change in the batchToEdit
    if (this.props !== prevProps) {
      this.batchesSelectedInUse = false;

      // If there's something to edit or the props don't match the default
      if (isEdit) {
        // Save the selected label we selected for edit
        this.batchesSelectedInUse = true;
        this.setState({
          batchesIncludedPct : this.props.batchesIncluded.pct,
          batchesIncludedCost : this.props.batchesIncluded.cost,
          batchesIncludedTotalWeightInGrams : this.props.batchesIncluded.totalWeightInGrams,
          batchesIncludedTotalCost : this.props.batchesIncluded.totalCost,
          batchesSelected : this.formatBatchesSelected()
        });
      }
    }
  }


  updateParent(recalculateDownstream) {
    this.props.onUpdate(this.state, recalculateDownstream);
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
  async onUpdateBatchSelection(batchesSelection, batchData) {
    let batchesIncludedPct = {};
    let batchesIncludedCost = {};
    let costTotal = 0;
    let weightTotal = 0;
    for (var i in batchesSelection) {
      let key = batchesSelection[i].label;
      let value = 100;
      if (this.state.batchesIncludedPct[key]) {
        value = this.state.batchesIncludedPct[key];
      }
      batchesIncludedPct[key] = value;
      batchesIncludedCost[key] = Math.round((value/100) * batchData[key].ingredientTotalCost * 1000)/1000;
      costTotal += batchesIncludedCost[key];
      weightTotal += (value/100) * batchData[key].batchTotalWeightInGrams;
    }
    costTotal = Math.round(costTotal * 100) /100;
    weightTotal = Math.round(weightTotal);

    await this.setState({
      batchesIncludedPct : batchesIncludedPct,
      batchesIncludedCost : batchesIncludedCost,
      batchesIncludedTotalWeightInGrams : weightTotal,
      batchesIncludedTotalCost : costTotal,
      batchesSelected : batchesSelection
    });

    this.updateParent();
  }

  async onUpdateBatchPct(id, newPct) {
    let batchesIncludedPct = this.state.batchesIncludedPct;
    let batchesIncludedCost = this.state.batchesIncludedCost;

    batchesIncludedPct[id] = newPct;
    batchesIncludedCost[id] = Math.round((newPct/100) * this.batchData[id].ingredientTotalCost * 1000)/1000;

    // Calculate weight and cost totals
    let batchesIncludedTotalCost = 0;
    let batchesIncludedTotalWeightInGrams = 0;
    let keys = Object.keys(this.state.batchesIncludedPct);
    for (const individualKeyIndex in keys) {
      let individualKey = keys[individualKeyIndex];
      batchesIncludedTotalCost += this.state.batchesIncludedCost[individualKey];
      batchesIncludedTotalWeightInGrams += (this.state.batchesIncludedPct[individualKey]/100) * this.batchData[individualKey].batchTotalWeightInGrams;
    }
    batchesIncludedTotalCost = Math.round(batchesIncludedTotalCost * 100) /100;
    batchesIncludedTotalWeightInGrams = Math.round(batchesIncludedTotalWeightInGrams);

    await this.setState({
      batchesIncludedPct,
      batchesIncludedCost,
      batchesIncludedTotalCost,
      batchesIncludedTotalWeightInGrams
    });
    this.updateParent(true);
  }

  updateBatchData(data) {
    this.batchData = data;
  }

  generateRenderPctInputByBatchSelection() {
    let self = this;
    let pctInputByBatchSelection = Object.keys(this.state.batchesIncludedPct).map((key) => (
           <BatchIncludedForm label={key} value={self.state.batchesIncludedPct[key]} onUpdateBatchPct={self.onUpdateBatchPct} key={key} />
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
          <div>
            Total Batch (Ingredients) Weight: <b>{this.state.batchesIncludedTotalWeightInGrams}</b> grams
          </div>
          <div>
            Total Batch (Ingredients) Cost: <b>${this.state.batchesIncludedTotalCost}</b>
          </div>
        </div>
        <FirebaseContext.Consumer>
          {firebase =>
              <LookupSelection
                firebase={firebase}
                onUpdateSelection={this.onUpdateBatchSelection}
                collectionName="batchesPublic"
                displayTitle="Batch"
                allowMultiple={true}
                sendDataOnUpdate={true}
                selectedData={this.state.batchesSelected}
                selectedDataInUse={this.batchesSelectedInUse}
                immediatelyUpdateBatchData={this.updateBatchData}
              />
            }
        </FirebaseContext.Consumer>
      </div>
    );
  }
}

export default BatchesIncluded;
