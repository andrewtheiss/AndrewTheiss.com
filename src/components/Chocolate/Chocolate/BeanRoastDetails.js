import React from 'react';
import { FirebaseContext } from '../../Firebase';
import ChocolateIngredients from '../Inventory/ChocolateIngredients.js'
import IngredientDetails from '../Inventory/Selections/Details.js'


class BeanRoastDetails extends React.Component {
  constructor(props) {
    super(props);
    this.addChocolate = this.addChocolate.bind(this);
    this.updateChocolate = this.updateChocolate.bind(this);
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
      var valuesFromNextSection = this.addAndFormatChocolateValuesFromSection(this.state.values[nextSelection]);
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
      if (this.state.values.Details != undefined) {
        this.chocolateToAdd = this.state.values.Details;
      }
  }

  formatStateFromChocolate() {

  }

  updateChocolate(values) {
    console.log('update chocolate',values);
    this.setState({values});
  }

  render() {
    //console.log(this.props);
    return (
      <div>

        <br />  <br />
        <ChocolateIngredients onChange={this.updateChocolate}/>
        <button onClick={this.addChocolate}>Add Chocolate</button>
       </div>
    );
  }
}

export default BeanRoastDetails;
