import React from 'react';
import CombineBatchIngredients from './CombineIngredients.js'
import NutritionCalculator from '../Ingredient/NutritionCalculator.js'
import SplitChocolateBatch from './Split.js'
import { FirebaseContext } from '../../Firebase';
import "./Batch.css"
import * as CONSTS from './constants.js'


class CreateNewChocolateBatch extends React.Component {
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
    this.addBeansToBatchIngredients = this.addBeansToBatchIngredients.bind(this);
    this.componentDidUpdate = this.componentDidUpdate.bind(this);

    this.state = {};
    this.formattedChocolate = {};
    this.batchIngredients = {};
    this.chocolateToAdd = {};

    // Added via views specific to this
    this.weightInGrams = 0;
    this.ingredientTotalCost = 0;
    this.ingredientList = "";
    this.nutritionFacts = {};

    // Variables to check Edit
    this.batchToEdit = undefined;
  }

  componentDidUpdate(prevProps) {
    let isEdit = (this.props.batchToEdit === undefined) ? false : true;
    let constString = JSON.stringify({'values' :CONSTS.CHOCOLATE_BATCH_DEFAULTS});
    if (isEdit &&
        this.props.batchToEdit !== prevProps.batchToEdit &&
        this.props.batchToEdit !== undefined
      ) {
      if (JSON.stringify(this.props.batchToEdit) !== constString) {
        this.batchToEdit = this.props.batchToEdit;
      }
      let values = this.props.batchToEdit;
      this.updateBatchDetails(values.values);
    } else {
      this.batchToEdit = undefined;
    }
  }

  addChocolateBatch() {
    this.formatChocolateForPublicAddition();

    console.log('try and add chocolate', this.chocolateToAdd.label, this.chocolateToAdd, this.state);
    const publicBatchesCollectionRef = this.props.firebase.db.collection("batchesPublic");
    publicBatchesCollectionRef.doc(this.chocolateToAdd.label).set(this.chocolateToAdd).then(() => {
      console.log('added public batch');
    });
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
    this.addBeansToBatchIngredients();

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
    let beanWeightInGrams = 0;
    let nibWeightInGrams = 0;
    let Beans = this.state.values.Beans;
    for (var i = 0; i < Beans.length; i++) {
      beanWeightInGrams += Number(Beans[i].beanWeightInGrams);
      nibWeightInGrams += Number(Beans[i].nibWeightInGrams);
    }
    this.chocolateToAdd['beanWeightInGrams'] = Number(beanWeightInGrams);
    this.chocolateToAdd['nibWeightInGrams'] = Number(nibWeightInGrams);
    this.chocolateToAdd['ingredientTotalCost'] = this.ingredientTotalCost;
  }

  addBeansToBatchIngredients() {
    let beans = this.state.values['Beans'];
    for (var i = 0; i < beans.length; i++) {
      this.chocolateToAdd.batchIngredients[beans[i]['beanId']] = Number(beans[i]['nibWeightInGrams']);
    }
  }

  async updateBatchDetails(values) {
    await this.setState({values});
  }

  updateWeight(batchWeightInGrams) {
    this.weightInGrams = batchWeightInGrams;
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
    let splitChocolateBatchIsActive = (this.batchToEdit === undefined) ? false : this.state;
    console.log('SPLIT BATCH VAL', splitChocolateBatchIsActive);
    return (
      <div className="batchCreationContainer">
        <div className="batchCreation leftSide">
          <br />
          <FirebaseContext.Consumer>
              {firebase => <CombineBatchIngredients selectedIngredients={this.state} onChange={this.updateBatchDetails} firebase={firebase}/>}
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
          <FirebaseContext.Consumer>
            {firebase => <SplitChocolateBatch
              firebase={firebase}
              batch={splitChocolateBatchIsActive}
              />
            }
          </FirebaseContext.Consumer>
        </div>
        <div className="batchCreationClear"></div>
       </div>
    );
  }
}

export default CreateNewChocolateBatch;
