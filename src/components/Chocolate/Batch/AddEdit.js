import React from 'react';
import CombineBatchIngredients from './CombineIngredients.js'
import NutritionCalculator from '../Ingredient/NutritionCalculator.js'
import SplitChocolateBatch from './Split.js'
import { FirebaseContext } from '../../Firebase';
import "./Batch.css"
import * as CONSTS from './constants.js'


class AddEditChocolateBatch extends React.Component {
  constructor(props) {
    super(props);
    this.addChocolateBatch = this.addChocolateBatch.bind(this);
    this.updateBatchDetails = this.updateBatchDetails.bind(this);
    this.formatChocolateForAddOrEdit = this.formatChocolateForAddOrEdit.bind(this);
    this.getAndFormatChocolateValuesFromSection = this.addAndFormatChocolateValuesFromSection.bind(this);
    this.addAndFormatChocolateValueDetails = this.addAndFormatChocolateValueDetails.bind(this);
    this.updateWeight = this.updateWeight.bind(this);
    this.updateIngredientTotalCost = this.updateIngredientTotalCost.bind(this);
    this.updateNutritionFacts = this.updateNutritionFacts.bind(this);
    this.updateIngredientList = this.updateIngredientList.bind(this);
    this.addBeansToBatchIngredients = this.addBeansToBatchIngredients.bind(this);
    this.componentDidUpdate = this.componentDidUpdate.bind(this);
    this.updateChocolateBatch = this.updateChocolateBatch.bind(this);
    this.generateAddOrEditButton = this.generateAddOrEditButton.bind(this);
    this.checkIfEditedLabelMatchCurrentLabel = this.checkIfEditedLabelMatchCurrentLabel.bind(this);
    this.setChocolateBatch = this.setChocolateBatch.bind(this);

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
    this.batchToEditLabel = undefined;
  }
  // Somewhere save this.props.batchToEdit.Details.label as this.batchToEditLabel
  componentDidUpdate(prevProps) {
    let isEdit = this.props.itemSelectedForEdit;

      // Only do something if there's a change in the batchToEdit
      if (this.props.batchToEdit !== prevProps.batchToEdit) {
        let editingBatchLabelMatchesCurrentBatchLabel = this.checkIfEditedLabelMatchCurrentLabel();

        // If there's something to edit or the props don't match the default
        if (isEdit) {
          // Set the batch to edit!
          this.batchToEdit = this.props.batchToEdit;

          // Save the selected label we selected for edit
          if (this.props.batchToEdit.values.Details) {
            this.batchToEditLabel = this.props.batchToEdit.values.Details.label;
          }
          let values = this.props.batchToEdit;
          this.updateBatchDetails(values.values);
        } else if (editingBatchLabelMatchesCurrentBatchLabel) {
            // Continue editing and don't change anything
        } else {
          this.batchToEdit = undefined;
          this.updateBatchDetails(CONSTS.CHOCOLATE_BATCH_DEFAULTS);
        }
      }
    }

    checkIfEditedLabelMatchCurrentLabel() {
      let matches = false;
      if (this.props.batchToEdit &&
        this.props.batchToEdit.values &&
        this.props.batchToEdit.values.Details &&
        this.props.batchToEdit.values.Details.label &&
        (this.batchToEditLabel === this.props.batchToEdit.values.Details.label)) {
          matches = true;
        }
      return matches;
    }

  setChocolateBatch(operation) {
    this.formatChocolateForAddOrEdit();
    let documentToEdit = this.state.values.Details.label;
    const publicBatchesCollectionRef = this.props.firebase.db.collection("batchesPublic");
    publicBatchesCollectionRef.doc(documentToEdit).set(this.chocolateToAdd).then(() => {
      console.log(operation+'d public batch');
    });
    const batchesCollectionRef = this.props.firebase.db.collection("batches");
    batchesCollectionRef.doc(documentToEdit).set(this.state).then(() => {
      console.log(operation+'d batch');
    });
  }

  addChocolateBatch() {
    this.setChocolateBatch('create');
  }

  updateChocolateBatch() {
    this.setChocolateBatch('update');
  }

  formatChocolateForAddOrEdit() {
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
    this.chocolateToAdd['batchTotalWeightInGrams'] = this.chocolateToAdd.nutritionFacts.servingSizeInGrams;
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

  generateAddOrEditButton() {
    if (this.batchToEdit === undefined) {
      return (<button onClick={this.addChocolateBatch}>Add Chocolate</button>);
    }
    return <button onClick={this.updateChocolateBatch}>Update Chocolate</button>
  }

  render() {
    let splitChocolateBatchIsActive = (this.batchToEdit === undefined) ? false : this.state;
    let addEditChocolateButton = this.generateAddOrEditButton();

    return (
      <div className="batchCreationContainer">
        <div className="batchCreation leftSide">
          <br />
          <FirebaseContext.Consumer>
              {firebase => <CombineBatchIngredients selectedIngredients={this.state} onChange={this.updateBatchDetails} firebase={firebase}/>}
          </FirebaseContext.Consumer>
          {addEditChocolateButton}
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

export default AddEditChocolateBatch;
