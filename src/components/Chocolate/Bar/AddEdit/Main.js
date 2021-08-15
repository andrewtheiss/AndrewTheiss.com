import React from 'react';
import * as CONSTS from '../constants.js'
import { FirebaseContext } from '../../../Firebase';
import LookupSelection from '../../../Utils/LookupSelection.js'
import BatchesIncluded from './BatchesIncluded.js'
import MoldSelection from './MoldSelection.js'
import '../Bar.css'
import * as UTILS from './NutritionFactsUtils.js'
/**
 *  AddEditBar
 *
 */
class AddEditBar extends React.Component {
  constructor(props) {
    super(props);
    this.onUpdateBatchesIncluded = this.onUpdateBatchesIncluded.bind(this);
    this.setBar = this.setBar.bind(this);
    this.validateBar = this.validateBar.bind(this);
    this.onUpdateDetails = this.onUpdateDetails.bind(this);
    this.updateBarSelection = this.updateBarSelection.bind(this);
    this.onUpdateBarsForMolds = this.onUpdateBarsForMolds.bind(this);
    this.generateLabel = this.generateLabel.bind(this);
    this.generateLabelButton = this.generateLabelButton.bind(this);
    this.formatBarsForWrite = this.formatBarsForWrite.bind(this);

    this.ingredientListOneTimeStorage = null;

    this.isEdit = false;
    this.recalculateMolds = false;
    this.updateIngredientsAndNutrition = false;
    this.state = CONSTS.DEFAULT_BAR;
    this.itemSelectedForEdit = false;
  }

  // Get data from DB in this function
  async componentDidMount() {
    const collectionRef = this.props.firebase.db.collection("ingredients");
    let self = this;
    await collectionRef.get().then(function(collectionDocs) {
      var ingredients = {};
      collectionDocs.forEach(function(doc) {
        ingredients[doc.id] = doc.data();
      });

      self.ingredientListOneTimeStorage = ingredients;
    });
  }

  componentDidUpdate(prevProps) {
    let isEdit = this.props.itemSelectedForEdit;
    this.recalculateMolds = false;

    // Only do something if there's a change in the batchToEdit
    if (this.props !== prevProps) {
      this.itemSelectedForEdit = false;

      // If there's something to edit or the props don't match the default
      if (isEdit) {

        this.isEdit = true;
        // Save the selected label we selected for edit
        if (this.props.itemSelectedForEdit) {
          let itemSelected = this.formatSelectedCategory(this.props.itemSelectedForEdit);
          this.setState(itemSelected);
        }
      } else {
        this.isEdit = false;
        this.setState(CONSTS.DEFAULT_BAR);
      }
    }
  }

  async onUpdateDetails(event) {
    var state = this.state;
    state[event.target.name] = event.target.value;
    await this.setState(state);
  }

  async formatBarForSet() {
    /*
    let latestAverageCostPerUnit = Math.round(Number(this.state.purchasedPrice / this.state.unitsPerItem)*100)/100 * Number((this.state.percentWaste / 100) + 1);
    await   this.setState({latestAverageCostPerUnit});


    return {
      category : this.state.category,
      label : this.state.label,
      imageBase64 : this.state.imageBase64,
      latestAverageCostPerUnit : this.state.latestAverageCostPerUnit
    };
    */
  }

  validateBar() {
    let valid = true;
    let alertStr = "";

    if (!this.state.label) {
      valid = false;
      alertStr += "You gotta have a bar label ... dude.";
    }

    if (!valid) {
      alert(alertStr);
    }
    return valid;
  }

  formatBarsForWrite() {
    let bars = [];

    let keysAsMoldId = Object.keys(this.state.barsFromMolds.barMoldDetails);
    for (var i in keysAsMoldId) {
      let moldId = keysAsMoldId[i];
      let bar = JSON.parse(JSON.stringify(this.state.barsFromMolds.barMoldDetails[moldId]));
      bar.id = this.state.label + "-" + bar.moldId;
      bar.created = this.state.createdDate;
      bars.push(bar);
    }
    return bars;
  }

  async setBar() {
    if (this.validateBar()) {

      //let publicBar = await this.formatBarForSet();
      let barToWrite = JSON.parse(JSON.stringify(this.state));
      let bars = this.formatBarsForWrite();
      // Used for rerendering
      delete barToWrite['value'];

      let documentToEdit = this.state.label;
      //console.log(barToWrite);
      console.log(bars);
      /*
      const collectionRef = this.props.firebase.db.collection("barGroup");
      await collectionRef.doc(documentToEdit).set(barToWrite).then(() => {
        console.log('set bar group');
      });
      */
      // Set each individual bar!

      for (var i = 0; i < bars.length; i++) {
        let barsCollectionRef = this.props.firebase.db.collection("barsPublic");
        await barsCollectionRef.doc(bars[i].id).set(bars[i]).then(() => {
          console.log('set bar: ' + bars[i].id);
        });
      }

      //let state = CONSTS.DEFAULT_BAR;
      //await this.setState(state);
    }
  }

  async updateBarSelection(barIdSelected, barData) {
    this.itemSelectedForEdit = true;
    let state = CONSTS.DEFAULT_BAR;

    if (barData && barIdSelected) {
      state = barData[barIdSelected];
    }
    await this.setState(state);
  }

  async setSelected(categorySelection) {
    await this.setState({categorySelection});
    let category = '';
    if (categorySelection.length > 0) {
      category = categorySelection[0].value;
      await this.setState({category});
    }
  }

  async onUpdateBatchesIncluded(batchesIncludedToFormat) {
    this.recalculateMolds = true;

    // Recaulculate batch nutrition facts
    // Returns [nutritionFacts, batchesIngredients, ingredientsLabel];
    let nutritionFactsIngredientsAndLabel = await UTILS.RecalculateNutritionFactsPerGram(
      batchesIncludedToFormat.batchesIncludedPct,
      this.props.firebase.db.collection("batchesPublic"),
      this.props.firebase.firebase.firestore.FieldPath.documentId(),
      this.ingredientListOneTimeStorage
    );
    this.updateIngredientsAndNutrition = true;

    let batchesIncluded = {
      pct : batchesIncludedToFormat.batchesIncludedPct,
      cost : batchesIncludedToFormat.batchesIncludedCost,
      totalWeightInGrams :batchesIncludedToFormat.batchesIncludedTotalWeightInGrams,
      totalCost : batchesIncludedToFormat.batchesIncludedTotalCost,
      nutritionFacts : nutritionFactsIngredientsAndLabel[0],
      batchIngredients : nutritionFactsIngredientsAndLabel[1],
      ingredients : nutritionFactsIngredientsAndLabel[2]
    };
    let value = Math.random();

    this.setState({
      batchesIncluded : batchesIncluded,
      value : value
    });
  }

  onUpdateBarsForMolds(barsFromMolds) {
    this.setState({barsFromMolds});
  }

  generateLabel() {
    // BATCH_BAR_IDS + Take date created
    let label = '';
    let batchesIncluded = Object.keys(this.state.batchesIncluded.cost);
    if (batchesIncluded.length === 1) {
      let batchIdFront = batchesIncluded[0].substring(0,8);
      let batchIdEnd = batchesIncluded[0].substring(batchesIncluded[0].length-1);
      label = batchIdFront + "-01" + batchIdEnd;
    } else if (batchesIncluded.length > 0) {

      // Need to get unique batches together, then to use letters for multiple of same batch
      // So HNA--0A and HNA--0B  would make something like ... HNA-2021-0AB
      // And HNA BLV would make HNA-BLV-210  (year(21) and index(0))
      // And HNA BLV RTE would make HNA-BLV-RTE-210  (year(21) and index(0))
      alert('Not supported for multiple bathes yet.  Try and generate something like in the comments');
      let keys = Object.keys(this.state.batchesIncluded.cost);
      for (var i = 0; i < keys.length; i++) {
        let batch = keys[i].substring(0,3);
        if (label.substring)
        label += batch;
      }

    } else {
      label = "WHT";
      if (this.state.createdDate) {
        label += "-" + this.state.createdDate.substring(2,4) + this.state.createdDate.substring(5,7) + this.state.createdDate.substring(8) + "-01";
      } else {
        label += "-" + (new Date().getFullYear() + "").slice(-2) + ('0' + new Date().getMonth()).slice(-2) +('0' + new Date().getDate()).slice(-2) + "-01";
      }
    }
    this.setState({label});
  }

  generateLabelButton() {
    if (this.isEdit) {
      return (<div></div>)
    }
    return (<div className="generateBarGroupLabel"><button onClick={this.generateLabel}>Generate Label</button></div>)
  }

  render() {
    let reclatulateMoldsFlag = this.recalculateMolds;
    let recalculateIndividualBarIngredientsAndNutrition = this.updateIngredientsAndNutrition;
    this.recalculateMolds = false;
    this.updateIngredientsAndNutrition = false;
    let generateLabelButton = this.generateLabelButton();
    return (
      <div>
        <div className="barAddEditExistingOutterContainer">
        <FirebaseContext.Consumer>
          {firebase =>
              <LookupSelection
                firebase={firebase}
                onUpdateSelection={this.updateBarSelection}
                collectionName="barGroup"
                displayTitle="Existing Bar"
                allowMultiple={false}
                sendDataOnUpdate={true}
              />
            }
        </FirebaseContext.Consumer>
        </div>
        <div className="barAddEditOutterContainer">
          <BatchesIncluded
            itemSelectedForEdit={this.itemSelectedForEdit}
            batchesIncluded={this.state.batchesIncluded}
            onUpdate={this.onUpdateBatchesIncluded}
          />
          <br />
          <FirebaseContext.Consumer>
            {firebase =>
              <MoldSelection
                  itemSelectedForEdit={this.itemSelectedForEdit}
                  firebase={firebase}
                  updateIngredientsAndNutrition={recalculateIndividualBarIngredientsAndNutrition}
                  batchesIncluded={this.state.batchesIncluded}
                  barsFromMolds={this.state.barsFromMolds}
                  onUpdateMoldSelection={this.onUpdateBarsForMolds}
                  recalculateMolds={reclatulateMoldsFlag}
                />
              }
          </FirebaseContext.Consumer>

          Label:  <input name="label"  onChange={this.onUpdateDetails} value={this.state.label} size="15" placeholder="" type="text"></input>
          {generateLabelButton}
          <br />Created: <input name="createdDate"  onChange={this.onUpdateDetails} value={this.state.createdDate} placeholder="" type="date"></input><br />
          Notes: <textarea name="notes"  onChange={this.onUpdateDetails} value={this.state.notes} type="text"></textarea><br />

          <button onClick={this.setBar}>Add Bar</button>
        </div>
      </div>
    );
  }
}

export default AddEditBar;
