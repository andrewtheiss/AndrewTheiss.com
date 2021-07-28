import React from 'react';
import CombineBatchIngredients from '../CombineIngredients.js'
import NutritionCalculator from '../../Ingredient/NutritionCalculator.js'
import { FirebaseContext } from '../../../Firebase';
import "../Batch.css"

/*
 *  Routing routes all Components with Route 'props' this taket
 */
class CreateNewChocolateBatchPage_Route extends React.Component {
  render() {
    return (
      <div>
      <FirebaseContext.Consumer>
          {firebase => <CreateNewChocolateBatchPage firebase={firebase}/>}
      </FirebaseContext.Consumer>
      </div>
    )
  };
};

class CreateNewChocolateBatchPage extends React.Component {
  constructor(props) {
    super(props);
    this.addChocolateBatch = this.addChocolateBatch.bind(this);
    this.updateBatchDetails = this.updateBatchDetails.bind(this);
    this.formatChocolateForPublicAddition = this.formatChocolateForPublicAddition.bind(this);
    this.getAndFormatChocolateValuesFromSection = this.addAndFormatChocolateValuesFromSection.bind(this);
    this.addAndFormatChocolateValueDetails = this.addAndFormatChocolateValueDetails.bind(this);
    this.updateWeight = this.updateWeight.bind(this);
    this.updateIngredientTotalCost = this.updateIngredientTotalCost.bind(this);
    this.updateNutritionFacts = this.updateNutritionFacts.bind(this);
    this.updateIngredientList = this.updateIngredientList.bind(this);
    console.log(this.props);
    this.state = {};
    this.formattedChocolate = {};
    this.batchIngredients = {};
    this.chocolateToAdd = {};

    // Added via views specific to this
    this.weightInGrams = 0;
    this.ingredientTotalCost = 0;
    this.ingredientList = "";
    this.nutritionFacts = {};
  }

  addChocolateBatch() {
    this.formatChocolateForPublicAddition();

    let self = this;
    console.log('try and add chocolate', this.chocolateToAdd.label, this.chocolateToAdd, this.state);
    const publicBatchesCollectionRef = this.props.firebase.db.collection("batchesPublic");
    //publicBatchesCollectionRef.doc(this.chocolateToAdd.label).set(this.chocolateToAdd).then(() => {
    //  console.log('added public batch');
    //});
    const batchesCollectionRef = this.props.firebase.db.collection("batches");
    batchesCollectionRef.doc(this.chocolateToAdd.label).set(this.state).then(() => {
      console.log('added batch');
    });
  //  console.log('try and add chocolate', this.chocolateToAdd.label, this.state);
  }

  formatChocolateForPublicAddition() {
    this.chocolateToAdd = {};
    this.batchIngredients = {};

    // Add non-ingredient params FIRST
    this.addAndFormatChocolateValueDetails();

    // Add MultiSelect Sections to ChocolateToAdd
    const selections = ['Dairy', 'Sweetener', 'Cocoa', 'Other'];
    for (var i = 0; i < selections.length; i++) {
      var nextSelection = selections[i];
      this.addAndFormatChocolateValuesFromSection(this.state.values[nextSelection]);
    }
    this.chocolateToAdd['batchIngredients'] = this.batchIngredients;

    // Add Nutrition Facts, Ingredients View List,
    this.chocolateToAdd['ingredients'] = this.ingredientList;
    this.chocolateToAdd['nutritionFacts'] = this.nutritionFacts;
  }

  addAndFormatChocolateValuesFromSection(values) {
      for (var i = 0; i < values.length; i++) {
        this.batchIngredients[values[i].value] = values[i].weight;
      }
  }

  addAndFormatChocolateValueDetails() {
    if (this.state.values.Details !== undefined) {
      this.chocolateToAdd = this.state.values.Details;
    }
    this.chocolateToAdd['weightInGrams'] = this.weightInGrams;
    this.chocolateToAdd['ingredientTotalCost'] = this.ingredientTotalCost;
  }

  formatStateFromChocolate() {

  }

  updateBatchDetails(values) {
    this.setState({values});
  }

  updateWeight(weightInGrams) {
    this.weightInGrams = weightInGrams;
  }

  updateIngredientTotalCost(ingredientTotalCost) {
    this.ingredientTotalCost = ingredientTotalCost;
  }

  updateIngredientList(formattedIngredientList) {
    this.ingredientList = formattedIngredientList;
  }

  updateNutritionFacts(nutritionFacts) {
    this.nutritionFacts = nutritionFacts;
  }

  render() {
    return (
      <div className="batchCreationContainer">
        <div className="batchCreation leftSide">
          <br />
          <FirebaseContext.Consumer>
              {firebase => <CombineBatchIngredients onChange={this.updateBatchDetails} firebase={firebase}/>}
          </FirebaseContext.Consumer>
          <button onClick={this.addChocolateBatch}>Add Chocolate</button>
        </div>
        <div className="batchCreation rightSide">
          <FirebaseContext.Consumer>
            {firebase => <NutritionCalculator
              selectedIngredients={this.state}
              firebase={firebase}
              onUpdateNutritionFacts={this.updateNutritionFacts}
              onUpdateIngredientList={this.updateIngredientList}
              onUpdateWeight={this.updateWeight}
              onUpdateTotalCost={this.updateIngredientTotalCost}
              />
            }
          </FirebaseContext.Consumer>
        </div>
        <div className="batchCreationClear"></div>
       </div>
    );
  }
}

export default CreateNewChocolateBatchPage_Route;
