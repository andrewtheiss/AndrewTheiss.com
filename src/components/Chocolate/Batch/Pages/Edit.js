import React from 'react';
import CombineBatchIngredients from '../CombineIngredients.js'
import NutritionCalculator from '../../Ingredient/NutritionCalculator.js'
import  { FirebaseContext } from '../../../Firebase';

class EditChocolateBatchPage extends React.Component {
  constructor(props) {
    super(props);
    this.addChocolate = this.addChocolate.bind(this);
    this.updateBatchDetails = this.updateBatchDetails.bind(this);
    this.formatChocolateFromState = this.formatChocolateFromState.bind(this);
    this.getAndFormatChocolateValuesFromSection = this.addAndFormatChocolateValuesFromSection.bind(this);
    this.addAndFormateChocolateValueDetails = this.addAndFormateChocolateValueDetails.bind(this);
    this.state = {};
    this.formattedChocolate = {};
    this.Ingredient = {};
    this.chocolateToAdd = {};
    this.totalCost = 0;
    this.totalWeight = 0;
  }

  addChocolate() {
    this.formatChocolateFromState();
    console.log('try and add chocolate', this.chocolateToAdd);
  }

  formatChocolateFromState() {
    this.chocolateToAdd = {};
    this.Ingredient = {};
    this.totalCost = 0;
    this.totalWeight = 0;

    // Add non-ingredient params FIRST
    this.addAndFormateChocolateValueDetails();

    // Format Beans 4/6/2021 Currently we only support one
    // Bug where second added bean overrides first one in BeanSummary.js viewer
    if(this.state.values.Beans.length > 1) {
      alert('Multiple Beans Not Yet Coded');
      return;
    }

    // Add MultiSelect Sections to ChocolateToAdd
    const selections = ['Dairy', 'Sweetener', 'Cocoa', 'Other'];
    for (var i = 0; i < selections.length; i++) {
      var nextSelection = selections[i];
      this.addAndFormatChocolateValuesFromSection(this.state.values[nextSelection]);
    }
    this.chocolateToAdd['Ingredient'] = this.Ingredient;

    console.log(this.state);
    // Format items in inventory + autocalculate cost


    return {};
  }

  addAndFormatChocolateValuesFromSection(values) {
      for (var i = 0; i < values.length; i++) {
        this.Ingredient[values[i].value] = values[i].weight;
      }
  }

  addAndFormateChocolateValueDetails() {
      if (this.state.values.Details !== undefined) {
        this.chocolateToAdd = this.state.values.Details;
      }
  }

  formatStateFromChocolate() {

  }

  updateBatchDetails(values) {
    console.log('update chocolate',values);
    this.setState({values});
  }

  render() {

    return (
      <div>
        <br />  <br />
        <CombineBatchIngredients onChange={this.updateBatchDetails}/>
        <button onClick={this.addChocolate}>Add Chocolate</button>
          <FirebaseContext.Consumer>
            {firebase => <NutritionCalculator ingredients={this.state} firebase={firebase} />}
          </FirebaseContext.Consumer>
       </div>
    );
  }
}

export default CreateNewChocolateBatchPage;
