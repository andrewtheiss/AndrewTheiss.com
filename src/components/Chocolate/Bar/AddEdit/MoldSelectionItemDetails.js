import React from 'react';
import "../Bar.css"
import { FirebaseContext } from '../../../Firebase';
import LookupSelection from '../../../Utils/LookupSelection.js'
import * as CONSTS from '../constants.js'
import * as UTILS from './NutritionFactsUtils.js'
import NutritionFactsPreview from '../../Ingredient/NutritionFactsPreview.js'

/**


<MoldSelectionItemDetails
 label={key}
 barMoldDetails={self.state.barMoldDetails[key]}
 onUpdateBarMoldDetails={self.onUpdateBarMoldDetails}
 key={key}
/>

 */
class MoldSelectionItemDetails extends React.Component {

  constructor(props) {
    super(props);
    this.onUpdateDetails = this.onUpdateDetails.bind(this);
    this.onUpdatePackagingWrap = this.onUpdatePackagingWrap.bind(this);
    this.onUpdatePackagingOverwrap = this.onUpdatePackagingOverwrap.bind(this);
    this.onUpdatePackagingLabel = this.onUpdatePackagingLabel.bind(this);
    this.onUpdatePackaging = this.onUpdatePackaging.bind(this);
    this.generatePreviewForSelectedWrapItems = this.generatePreviewForSelectedWrapItems.bind(this);
    this.recalculatePricePerBar = this.recalculatePricePerBar.bind(this);
    this.recalculateTotalPrice = this.recalculateTotalPrice.bind(this);
    this.recalculateUpstreamBarCosts = this.recalculateUpstreamBarCosts.bind(this);
    this.updateTotals = this.updateTotals.bind(this);
    this.checkAndSetForEditExisting = this.checkAndSetForEditExisting.bind(this);
    this.calculateNutritionFactsPerBar = this.calculateNutritionFactsPerBar.bind(this);

    this.selectedPackaging = {
      wrap : [],
      overwrap : [],
      label : []
    };
    this.checkAndSetForEditExisting();

    // contains map of all mold data for molds
    this.itemMoldData = this.props.moldData;
    this.packagingSelectionInUse = false;

    let state = JSON.parse(JSON.stringify(this.props.barMoldSelectionItemDetail));
    if (!state.barWeight) {
      state.barWeight = this.itemMoldData.barWeightInGrams;
    }
    if (!state.label) {
      state.label = this.itemMoldData.label;
    }
    if (!state.moldId) {
      state.moldId = this.itemMoldData.id;
    }
    if (!state.barPieceCount) {
      state.barPieceCount = this.itemMoldData.barPieceCount;
    }
    if (!state.barServingSizeInPieces) {
      state.barServingSizeInPieces = this.itemMoldData.barServingSizeInPieces;
    }
    this.state = state;
    this.calculateNutritionFactsPerBar();
  }

    // If batchesIncludedPct prop changes, we need to recalculate everything
    componentDidUpdate(prevProps) {

      if (this.props != prevProps) {

        if (this.props.updateIngredientsAndNutrition) {
          this.calculateNutritionFactsPerBar();
        }
        // Only do something if there's a change in the batchToEdit
        if (this.props.barMoldSelectionItemDetail !== prevProps.barMoldSelectionItemDetail ||
          this.state.pricePerBar !== this.props.barMoldSelectionItemDetail.pricePerBar) {
          let isEdit = this.props.itemSelectedForEdit;

          // If there's something to edit or the props don't match the default
          if (isEdit) {
            let state = JSON.parse(JSON.stringify(this.props.barMoldSelectionItemDetail));
              this.setState(state);
            }
        }
      }
    }


  checkAndSetForEditExisting() {
    if (this.props.barMoldSelectionItemDetail.barCount ||
      !Object.keys(this.props.barMoldSelectionItemDetail.packagingSelection.label).length ||
      !Object.keys(this.props.barMoldSelectionItemDetail.packagingSelection.wrap).length ||
      !Object.keys(this.props.barMoldSelectionItemDetail.packagingSelection.overwrap).length)
      {
        let keys = Object.keys(CONSTS.BAR_MOLD_CATEGORIES_STRINGS);
        for (var i = 0; i < keys.length; i++) {
          let packagingType = keys[i];
          let selectedArray = [];
          let selectedValues = this.props.barMoldSelectionItemDetail.packagingSelection[packagingType];

         let selectedValueKeys = Object.keys(selectedValues);
          for (var j = 0; j < selectedValueKeys.length; j++) {
            selectedArray.push({label : selectedValueKeys[j], value : selectedValueKeys[j]});
          }
          this.selectedPackaging[packagingType] = selectedArray;
        }
          this.packagingSelectionInUse = true;
      }
  }

  async onUpdateDetails(event) {
    await this.setState({[event.target.name] : event.target.value});

    // Recaulaulte upstream bar costs
    if (event.target.name === "barCount") {
      this.updateTotals();
      this.recalculateUpstreamBarCosts();
    }
  }

  async updateTotals() {
    let totals = {
      packagingPrice : 0,
      weight : 0
    };

    totals.packagingPrice = Math.round(this.state.totalPackagingPricePerUnit * this.state.barCount * 100)/100;
    totals.weight = Math.round(this.state.barCount * this.itemMoldData.barWeightInGrams);
    await this.setState({totals});
  }

  onUpdatePackagingWrap(selection, selectionData) {
    this.onUpdatePackaging(selection,selectionData, CONSTS.BAR_MOLD_CATEGORIES_STRINGS.wrap);
  }
  onUpdatePackagingOverwrap(selection, selectionData) {
    this.onUpdatePackaging(selection,selectionData, CONSTS.BAR_MOLD_CATEGORIES_STRINGS.overwrap);
  }
  onUpdatePackagingLabel(selection, selectionData) {
    this.onUpdatePackaging(selection,selectionData, CONSTS.BAR_MOLD_CATEGORIES_STRINGS.label);
  }

  onUpdatePackaging(selection, selectionData, packagingSubcategory) {
    // Format packaging selection type
    let packagingSelection = this.state.packagingSelection;
    let type = {};
    for (var i in selection) {
      let key = selection[i].label;
      let data = selectionData[key];
      let details = {
        imageBase64 : data['imageBase64'],
        latestAverageCostPerUnit : data['latestAverageCostPerUnit'],
      };
      type[key] = details;
    }

    packagingSelection[packagingSubcategory] = type;
    this.setState({packagingSelection});
    this.recalculatePricePerBar(packagingSubcategory);
  }

  recalculateTotalPrice() {
    let totalPackagingPricePerUnit = 0;
    for (var i in CONSTS.BAR_MOLD_CATEGORIES_ARRAY) {
      let type = CONSTS.BAR_MOLD_CATEGORIES_ARRAY[i];
      totalPackagingPricePerUnit += this.state.packagingPricesPerBar[type];
    }
    totalPackagingPricePerUnit = Math.round(totalPackagingPricePerUnit * 1000)/1000;
    this.setState({totalPackagingPricePerUnit});
    this.updateTotals();
    this.recalculateUpstreamBarCosts();
  }

  recalculatePricePerBar(packagingSubcategory) {
    let packagingPricesPerBar = this.state.packagingPricesPerBar;
    packagingPricesPerBar[packagingSubcategory] = 0;
    let type = this.state.packagingSelection[packagingSubcategory];
    let keys = Object.keys(type);
    for (var i in keys) {
      packagingPricesPerBar[packagingSubcategory] += type[keys[i]].latestAverageCostPerUnit;
    }
    this.setState({packagingPricesPerBar});
    this.recalculateTotalPrice();
  }

  recalculateUpstreamBarCosts() {
    this.props.onUpdateBarMoldDetails(this.state);
  }

  generatePreviewForSelectedWrapItems() {

  }

  // Uses batches included data to update nutrition facts per bar
  async calculateNutritionFactsPerBar() {
    let moldNutritionFacts = UTILS.AdjustNutritionFactsAndServingSizeForBar(
      this.state,
      this.props.batchesIncluded
    );

    if (Object.keys(moldNutritionFacts).length !== 0) {
      let state = this.state;
      state.nutritionFacts = moldNutritionFacts;
      state.ingredients = this.props.batchesIncluded.ingredients;
      await this.setState(state);
    } else {
      let state = this.state;
      state.nutritionFacts = {};
      state.ingredients = "";
      await this.setState(state);
    }
  }

  render() {
    let imagesForPreview = this.generatePreviewForSelectedWrapItems();
    let totalPackagingPricePerUnit = this.state.totalPackagingPricePerUnit;

    const collectionRefSearchWrap = this.props.firebase.db.collection("packaging").where("category", "==", CONSTS.BAR_MOLD_DB_CATEGORIES_STRINGS.wrap);
    const collectionRefSearchOverwrap = this.props.firebase.db.collection("packaging").where("category", "==", CONSTS.BAR_MOLD_DB_CATEGORIES_STRINGS.overwrap);
    const collectionRefSearchLabel = this.props.firebase.db.collection("packaging").where("category", "==", CONSTS.BAR_MOLD_DB_CATEGORIES_STRINGS.label);

    let nutritionFactsPreview = <NutritionFactsPreview previewData={this.state.nutritionFacts} ingredientList={this.state.ingredients}/>;
    return (
      <div>
      <div>
        <img src={this.itemMoldData['imageBase64']} alt="bar mold for this batch" className="moldSelectionBarMoldImagePreview"></img>
        <p className="moldSelectionLabel"><b>{this.props.label}</b></p>
        <p className="moldSelectionLabel"><b>Price Per Bar: ${this.state.pricePerBar}</b></p>
        <div><b>Packaging Price Per Unit: ${totalPackagingPricePerUnit}</b></div>
        <div><b>Weight of All Bars: {this.state.totals.weight} grams</b></div>
        <div><b>Total Packaging Cost: ${this.state.totals.packagingPrice}</b></div>
        Bar Count:  <input name="barCount"  onChange={this.onUpdateDetails} value={this.state.barCount} size="5" placeholder="" type="text"></input><br />
      </div>
        <FirebaseContext.Consumer>
          {firebase =>
              <LookupSelection
                firebase={firebase}
                onUpdateSelection={this.onUpdatePackagingWrap}
                collectionName="packaging"
                displayTitle="Packaging Wrap"
                allowMultiple={true}
                sendDataOnUpdate={true}
                customSearch={collectionRefSearchWrap}
                selectedData={this.selectedPackaging['wrap']}
                selectedDataInUse={this.packagingSelectionInUse}
              />
            }
        </FirebaseContext.Consumer>
      <FirebaseContext.Consumer>
        {firebase =>
            <LookupSelection
              firebase={firebase}
              onUpdateSelection={this.onUpdatePackagingOverwrap}
              collectionName="packaging"
              displayTitle="Packaging Overwrap"
              allowMultiple={true}
              sendDataOnUpdate={true}
              customSearch={collectionRefSearchOverwrap}
              selectedData={this.selectedPackaging['overwrap']}
              selectedDataInUse={this.packagingSelectionInUse}
            />
          }
      </FirebaseContext.Consumer>
      <FirebaseContext.Consumer>
        {firebase =>
            <LookupSelection
              firebase={firebase}
              onUpdateSelection={this.onUpdatePackagingLabel}
              collectionName="packaging"
              displayTitle="Packaging Label"
              allowMultiple={true}
              sendDataOnUpdate={true}
              customSearch={collectionRefSearchLabel}
              selectedData={this.selectedPackaging['label']}
              selectedDataInUse={this.packagingSelectionInUse}
            />
          }
      </FirebaseContext.Consumer>
      <div className="barMoldDetailSelectionPreview">
      {nutritionFactsPreview}
      </div>
    </div>
    );
  }
}

export default MoldSelectionItemDetails;


/*
barCount : '',
barWeight : '',
packagingPricesPerBar : {
  wrap : 0,
  overwrap : 0,
  label : 0
},
packagingSelection : {
  wrap : {},
  overwrap : {},
  label : {}
},
nutritionFacts : {

}
Calculate cost based on the % of different bars which make up the batch
Calculate nutrition facts
*/
