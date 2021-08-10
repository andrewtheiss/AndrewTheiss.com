import React from 'react';
import "../Bar.css"
import { FirebaseContext } from '../../../Firebase';
import LookupSelection from '../../../Utils/LookupSelection.js'
import * as CONSTS from '../constants.js'

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

    // contains map of all mold data for molds
    this.itemMoldData = this.props.moldData;

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
    this.state = state;


    //console.log(this.props, this.itemMoldData);
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

  render() {
    let imagesForPreview = this.generatePreviewForSelectedWrapItems();
    let totalPackagingPricePerUnit = this.state.totalPackagingPricePerUnit;

    const collectionRefSearchWrap = this.props.firebase.db.collection("packaging").where("category", "==", CONSTS.BAR_MOLD_DB_CATEGORIES_STRINGS.wrap);
    const collectionRefSearchOverwrap = this.props.firebase.db.collection("packaging").where("category", "==", CONSTS.BAR_MOLD_DB_CATEGORIES_STRINGS.overwrap);
    const collectionRefSearchLabel = this.props.firebase.db.collection("packaging").where("category", "==", CONSTS.BAR_MOLD_DB_CATEGORIES_STRINGS.label);
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
            />
          }
      </FirebaseContext.Consumer>
      <div className="barMoldDetailSelectionPreview">
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
