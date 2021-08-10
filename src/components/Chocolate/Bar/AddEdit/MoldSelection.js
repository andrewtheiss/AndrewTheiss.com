import React from 'react';
import * as CONSTS from '../constants.js'
import { FirebaseContext } from '../../../Firebase';
import MoldSelectionItemDetails from './MoldSelectionItemDetails.js'
import LookupSelection from '../../../Utils/LookupSelection.js'
import '../Bar.css'

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
    this.onUpdateBarMoldDetails = this.onUpdateBarMoldDetails.bind(this);
    this.recalculateBarCosts = this.recalculateBarCosts.bind(this);

    // If something is selected for edit, override views
    this.editSelectionInUse = false;
    this.moldData = undefined;

    this.state = {
      barMoldDetails : this.props.barsFromMolds.barMoldDetails,
      barMoldsSelected : this.formatMoldsSelected(),
      totalWeightAllBars : 0,
      totalPackagingCostAllBars : 0
    }
  }

  formatMoldsSelected() {
    let formattedMoldSelection = [];
    Object.keys(this.props.barsFromMolds.barMoldDetails).forEach(function(key) {
      formattedMoldSelection.push({label : key, value : key});
    })
    return formattedMoldSelection;
  }

  // If batchesIncludedPct prop changes, we need to recalculate everything
  componentDidUpdate(prevProps) {

    // Only do something if there's a change in the batchToEdit
    if (this.props !== prevProps) {
      let isEdit = this.props.itemSelectedForEdit;
      this.editSelectionInUse = false;

      // If there's something to edit or the props don't match the default
      if (isEdit) {

        // Save the selected label we selected for edit
        this.editSelectionInUse = true;
        if (this.props.itemSelectedForEdit) {
          this.setState({
            barMoldDetails : this.props.barMoldDetails,
            barMoldsSelected : this.formatMoldsSelected()
          });
        }

      }
      else if (
        this.props.batchesIncluded.totalCost !== prevProps.batchesIncluded.totalCost ||
        this.props.recalculateMolds
      ) {

        // Recalculate individual bar/mold selection
        console.log('recalculate bar mold costs and nutrition');
        this.recalculateBarCosts();
      }

    } // End check if props are same
  }


  updateParent() {
    let state = JSON.parse(JSON.stringify(this.state));
    delete state['barMoldsSelected'];
    this.props.onUpdateMoldSelection(state);
  }

  async recalculateBarCosts() {
    // Need to find cost based on total batch selection divided by total weight of bars poured
    let totalBatchSelectionCost = this.props.batchesIncluded.totalCost;
    let totalBatchSelectionWeight = this.props.batchesIncluded.totalWeightInGrams;

    // Grab the bar selection data
    let totalWeightOfPouredBars = this.state.totalWeightAllBars;

    // Cost of bars poured is more expensive than raw ingredients
    let costPerGramPoured = totalBatchSelectionCost / totalWeightOfPouredBars;

    // Go through each mold and calculate individual ingredient cost
    let barMoldDetails = this.state.barMoldDetails;
    let keys = Object.keys(barMoldDetails);
    for (var i = 0; i < keys.length; i++) {
      let barMold = barMoldDetails[keys[i]];
      if (barMold.barCount) {
      barMold.totalIngredientPricePerUnit = Math.ceil(costPerGramPoured * barMold.barWeight * 1000) / 1000;
    } else {
      barMold.totalIngredientPricePerUnit = 0;
    }
      barMold.pricePerBar = Math.ceil((barMold.totalIngredientPricePerUnit + barMold.totalPackagingPricePerUnit)*1000)/1000;
    }

    await this.setState({barMoldDetails});
        console.log(this.state.barMoldDetails);
  }

  async onUpdateBarMoldDetails(moldState) {

    let barMoldDetails = this.state.barMoldDetails;
    barMoldDetails[moldState.label] = moldState;
    await this.setState({barMoldDetails});

    // Recalculate weight of all molds and bars being used
    // Store individual wrapping cost per mold (and total wrapping from all molds)
    // Divide the total cost of all selected batches (**Need to calculate this first upstream),
        // by the weight of all molds and bars
    // Recalculate totalBarWeight
    let totalWeightAllBars = 0
    let totalPackagingCostAllBars = 0;
    let keys = Object.keys(this.state.barMoldDetails);
    for (var i = 0; i < keys.length; i++) {
      let barMold = this.state.barMoldDetails[keys[i]];
      totalWeightAllBars += barMold.totals.weight;
      totalPackagingCostAllBars += barMold.totals.packagingPrice;
    }
    totalWeightAllBars = Math.round(totalWeightAllBars * 100) /100;
    totalPackagingCostAllBars = Math.round(totalPackagingCostAllBars * 100) /100;

    let state = this.state;
    state.totalWeightAllBars = totalWeightAllBars;
    state.totalPackagingCostAllBars = totalPackagingCostAllBars;

    await this.setState(state);
    console.log(moldState, this.state);
    this.recalculateBarCosts();
    this.updateParent();
  }

  generateRenderPerBarMoldSelection() {
    let self = this;
    let barMoldDetails = Object.keys(this.state.barMoldDetails).map((key) => (
      <span className="barMoldDetailsContainerForBarCreation" key={key}>
        <FirebaseContext.Consumer>
          {firebase =>
              <MoldSelectionItemDetails
               label={key}
               barMoldSelectionItemDetail={self.state.barMoldDetails[key]}
               onUpdateBarMoldDetails={self.onUpdateBarMoldDetails}
               firebase={firebase}
               key={key}
               moldData={self.moldData[key]}
               />
             }
         </FirebaseContext.Consumer>
       </span>
       ));
    return barMoldDetails;
  }

  updateBarMoldSelection(moldSelection, moldData) {
    let prevBarMoldDetails = this.state.barMoldDetails;
    let barMoldDetails = {};
    for (var i in moldSelection) {
      if (prevBarMoldDetails[moldSelection[i].label]) {
        barMoldDetails[moldSelection[i].label] = prevBarMoldDetails[moldSelection[i].label];
      } else {
        barMoldDetails[moldSelection[i].label] = CONSTS.BAR_FROM_MOLD_DETAILS;
      }
    }
    this.moldData = moldData;
    this.setState({barMoldDetails});
  }

  render() {
    let barMoldDetails = this.generateRenderPerBarMoldSelection();

    return (
      <div key="barMoldSelectionContainerKey" className="barBatchSelection">
        <div key="barMoldSelectionKey">
         <b>Bar Selection and Details</b>
         <div key="moldSizeKey">
         <FirebaseContext.Consumer>
           {firebase =>
             <LookupSelection
               firebase={firebase}
               onUpdateSelection={this.updateBarMoldSelection}
               collectionName="moldSize"
               displayTitle="Bar Molds"
               allowMultiple={true}
               sendDataOnUpdate={true}
               key="lookupSelectionForUpdateBarMoldKey"
               />
             }
         </FirebaseContext.Consumer>
        </div>
        <div key="moldDetailsKey" className="barBatchSelectionPctInputs">
          {barMoldDetails}
        </div>
        </div>
      </div>
    );
  }
}

export default MoldSelection;
