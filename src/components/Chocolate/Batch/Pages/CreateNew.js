import React from 'react';
import CombineBatchIngredients from '../CombineIngredients.js'
import NutritionCalculator from '../../Ingredient/NutritionCalculator.js'
import  { FirebaseContext } from '../../../Firebase';
import "../Batch.css"

class CreateNewChocolateBatchPage extends React.Component {
  constructor(props) {
    super(props);
    this.addChocolateBatch = this.addChocolateBatch.bind(this);
    this.updateBatchDetails = this.updateBatchDetails.bind(this);
    this.formatChocolateFromState = this.formatChocolateFromState.bind(this);
    this.getAndFormatChocolateValuesFromSection = this.addAndFormatChocolateValuesFromSection.bind(this);
    this.addAndFormateChocolateValueDetails = this.addAndFormateChocolateValueDetails.bind(this);
    this.updateWeight = this.updateWeight.bind(this);
    this.updateIngredientTotalCost = this.updateIngredientTotalCost.bind(this);

    this.state = {};
    this.formattedChocolate = {};
    this.batchIngredients = {};
    this.chocolateToAdd = {};

    // Added via views specific to this
    this.weightInGrams = 0;
    this.ingredientTotalCost = 0;
    this.ingredientList = "";
  }

  addChocolateBatch() {
    this.formatChocolateFromState();
    console.log('try and add chocolate', this.chocolateToAdd);
  }

  formatChocolateFromState() {
    this.chocolateToAdd = {};
    this.batchIngredients = {};

    // Add non-ingredient params FIRST
    this.addAndFormateChocolateValueDetails();

    // Add MultiSelect Sections to ChocolateToAdd
    const selections = ['Dairy', 'Sweetener', 'Cocoa', 'Other'];
    for (var i = 0; i < selections.length; i++) {
      var nextSelection = selections[i];
      this.addAndFormatChocolateValuesFromSection(this.state.values[nextSelection]);
    }
    this.chocolateToAdd['batchIngredients'] = this.batchIngredients;

    console.log(this.state);
    // Format items in inventory + autocalculate cost


    return {};
  }

  addAndFormatChocolateValuesFromSection(values) {
      for (var i = 0; i < values.length; i++) {
        this.batchIngredients[values[i].value] = values[i].weight;
      }
  }

  addAndFormateChocolateValueDetails() {
    if (this.state.values.Details !== undefined) {
      this.chocolateToAdd = this.state.values.Details;
    }
    this.chocolateToAdd['weightInGrams'] = this.weightInGrams;
    this.chocolateToAdd['ingredientTotalCost'] = this.ingredientTotalCost;
  }

  formatStateFromChocolate() {

  }

  updateBatchDetails(values) {
    console.log('update chocolate',values);
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
            {firebase => <NutritionCalculator selectedIngredients={this.state} firebase={firebase} onUpdateWeight={this.updateWeight}  onUpdateTotalCost={this.updateIngredientTotalCost}/>}
          </FirebaseContext.Consumer>
        </div>
        <div className="batchCreationClear"></div>
       </div>
    );
  }
}

export default CreateNewChocolateBatchPage;
