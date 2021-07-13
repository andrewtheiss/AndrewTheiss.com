import React from 'react';
import MultiSelect from "react-multi-select-component";
import IngredientNurtitionFacts from './NutritionFacts.js'
import * as CONSTS from './constants.js'

class Ingredients extends React.Component {
  constructor(props) {
    super(props);
    this.renderNonNutritionParams = this.renderNonNutritionParams.bind(this);
    this.formatCategoryOptions = this.formatCategoryOptions.bind(this);
    this.setSelected = this.setSelected.bind(this);
    this.onChangeIngredientProp = this.onChangeIngredientProp.bind(this);
    // When state changes, render is called
    var categoryCategories = this.formatCategoryOptions();
    this.state = {
      name : '',
      category : '',
      notes : '',
      origin : '',
      source : '',
      totalWeightPerItem : '',
      pricePerKg : 0,
      countPurchased : 0,
      latestPurchasePrice : 0,
      runningTotalOfPurchasedCosts : 0,
      nutritionFacts : {},
      image : '',
      categoryCategories : categoryCategories,
      categorySelection : []
    };
  }

  updateElement(event) {

  }
  formatCategoryOptions() {
     var categoryCategories = [];
     var categoryOptions = CONSTS.INGREDIENT_CATEGORIES;
     for (var i = 0; i < categoryOptions.length; i++) {
       categoryCategories.push({label : CONSTS.INGREDIENT_CATEGORIES[i], value : CONSTS.INGREDIENT_CATEGORIES[i]});
     }
     return categoryCategories;
  }

  // Set Selected Ingredients so we can update the value of their weight in grams
  async setSelected(categorySelection) {
    await this.setState({categorySelection});
  }

  onChangeIngredientProp(event) {
    this.setState({[event.target.name]:event.target.value});
  }

  renderNonNutritionParams() {
    var nonNutritionItems = CONSTS.NON_NUTRITION_PARAMS;
    var strings = CONSTS.NUTRITION_LABEL_STRINGS;
    var placeholders = CONSTS.NUTRITION_PLACEHOLDER_STRINGS;
    var self = this;
    var nonNutritionParams = Object.keys(CONSTS.NON_NUTRITION_PARAMS).map((key) => (
      <div key={key} >
        <b>{strings[key]}: </b><input name={key} value={self.state[key]} type="text" onChange={this.onChangeIngredientProp}></input>
      </div>
    ));
    return nonNutritionParams;
  }



  render() {
    this.nonNutritionParams = this.renderNonNutritionParams();
    const options = CONSTS.INGREDIENT_CATEGORIES;
    return (
      <div>
        <div>Add Ingredient</div>
        {this.nonNutritionParams}

        <b>Category: </b><MultiSelect
          options={this.state.categoryCategories}
          value={this.state.categorySelection}
          onChange={this.setSelected}
          labelledBy="Select"
        />
        <br />
       </div>
    );
  }
}
 export default Ingredients;
