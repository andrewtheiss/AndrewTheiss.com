import React from 'react';
import MultiSelect from "react-multi-select-component";
import IngredientNurtitionFacts from './NutritionFacts.js'
import IngredientImage from './Image.js'
import IngredientPreview from './Preview.js'
import * as CONSTS from './constants.js'

class IngredientNew extends React.Component {
  constructor(props) {
    super(props);
    this.renderNonNutritionParams = this.renderNonNutritionParams.bind(this);
    this.formatCategoryOptions = this.formatCategoryOptions.bind(this);
    this.setSelected = this.setSelected.bind(this);
    this.onChangeIngredientProp = this.onChangeIngredientProp.bind(this);
    this.updateNutritionFacts = this.updateNutritionFacts.bind(this);
    this.updateImage = this.updateImage.bind(this);
    this.addIngredient = this.addIngredient.bind(this);

    // When state changes, render is called
    var categoryCategories = this.formatCategoryOptions();
    this.state = {
      name : '',
      category : '',
      notes : '',
      origin : '',
      source : '',
      totalGramWeightPerItem : '100',
      pricePerKg : 0,
      costPerItem : "1.00",
      countPurchased : 1,
      latestPurchasePrice : "1.00",
      runningTotalOfPurchasedCosts : 0,
      nutritionFacts : {},
      imageBase64 : '',
      categoryCategories : categoryCategories,
      categorySelection : [],
      changeLog : ''
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

  // Set Selected Ingredient so we can update the value of their weight in grams
  async setSelected(categorySelection) {
    await this.setState({categorySelection});
    let category = '';
    if (categorySelection.length > 0) {
      category = categorySelection[0].value;
      await this.setState({category});
    }
  }

  async onChangeIngredientProp(event) {
    await this.setState({[event.target.name]:event.target.value});

    let latestPurchasePrice = this.state.costPerItem;
    if (event.target.name === 'costPerItem') {
      this.setState({latestPurchasePrice});
    }
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

  updateNutritionFacts(facts) {
    let nutritionFacts = facts;
    this.setState({nutritionFacts});
  }

  updateImage(imageUpload) {
    let imageBase64 = imageUpload.image;
    this.setState({imageBase64});
  }

  addIngredient() {

    // Calculate pricePerKg
    let pricePerKg = this.state.totalGramWeightPerItem * 1000 / this.state.costPerItem;
    this.setState({pricePerKg});

    let latestPurchasePrice = this.state.costPerItem;
    this.setState({latestPurchasePrice});

    console.log('Adding Ingredient', this.state);
  }

  render() {
    this.nonNutritionParams = this.renderNonNutritionParams();
    let ingredientPreview = <IngredientPreview ingredient={this.state} />;
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
        <IngredientNurtitionFacts onUpdate={this.updateNutritionFacts} facts={this.state.nutritionFacts}/>
        <IngredientImage onUpdate={this.updateImage} image={this.state.image} />
        <button onClick={this.addIngredient}>Add Ingredient</button>
        {ingredientPreview}
       </div>
    );
  }
}
 export default IngredientNew;
