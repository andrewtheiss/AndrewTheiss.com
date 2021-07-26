import React from 'react';
import { FirebaseContext } from '../../Firebase';
import MultiSelect from "react-multi-select-component";
import IngredientNurtitionFacts from './NutritionFacts.js'
import IngredientImage from './Image.js'
import IngredientPreview from './Preview.js'
import * as CONSTS from './constants.js'
import './Ingredient.css'

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
    this.writeToDatabase = this.writeToDatabase.bind(this);
    this.getDefaultState = this.getDefaultState.bind(this);
    this.reset = this.reset.bind(this);
    this.renderRecentlyAdded = this.renderRecentlyAdded.bind(this);
    this.updateRecentlyAdded = this.updateRecentlyAdded.bind(this);

    this.defaultState = this.getDefaultState();
    this.state = this.getDefaultState();

    // After adding we update recently added
    this.recentlyAdded = null;
  }

  getDefaultState() {
    var categoryCategories = this.formatCategoryOptions();
    return {
      name : '',
      category : '',
      notes : '',
      origin : '',
      source : '',
      totalGramWeightPerItem : '100',
      latestPricePerKg : 0,
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

  async reset() {
    await this.setState(this.defaultState);
  }

  async updateRecentlyAdded(name) {
      const ingredientsCollectionRef = this.props.firebase.db.collection("ingredients");
      let self = this;
      await ingredientsCollectionRef.where("name", "==", name).get().then(function(ingredientCollectionDocs) {
        ingredientCollectionDocs.forEach(function(doc) {
          self.recentlyAdded = doc.data();
        });
      });
  }

  renderRecentlyAdded() {
    if (this.recentlyAdded === null) {
      return <div></div>;
    }

    return <IngredientPreview ingredient={this.recentlyAdded} />
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

  async addIngredient() {
    let latestPurchasePrice = this.state.costPerItem;
    this.setState({latestPurchasePrice});

    let runningTotalOfPurchasedCosts = Number(this.state.countPurchased) * Number(this.state.costPerItem);
    this.setState({runningTotalOfPurchasedCosts});

    let changeLog = "Created entry on:" + new Date().toDateString();
    this.setState({changeLog});

    let latestPricePerKg = Math.round((Number(this.state.latestPurchasePrice) / Number(this.state.totalGramWeightPerItem)) * 1000000) / 1000;
    await this.setState({latestPricePerKg});

    let ingredientToWrite = JSON.parse(JSON.stringify(this.state));

    // Cleanup object properties for UI
    delete ingredientToWrite['categoryCategories'];
    delete ingredientToWrite['categorySelection'];
    this.writeToDatabase(ingredientToWrite);
  }

  writeToDatabase(ingredientToWrite) {
    let self = this;
    const ingredientsCollectionRef = this.props.firebase.db.collection("ingredients");
    ingredientsCollectionRef.doc(ingredientToWrite.name).set(ingredientToWrite).then(() => {
      self.updateRecentlyAdded(ingredientToWrite);
      self.reset();
    });
  }

  render() {
    this.nonNutritionParams = this.renderNonNutritionParams();
    let ingredientPreview = <IngredientPreview ingredient={this.state} />;
    let latestAddedPreview = this.renderRecentlyAdded();
    const options = CONSTS.INGREDIENT_CATEGORIES;
    return (
      <div>
        <div className="newIngredientAddDetailsFormContainer ib">
          <div className="newIngredientAddIngredientTitle">Add Ingredient</div>
          {this.nonNutritionParams}
          <div className="newIngredientMultiselectContainer">
            <b>Category: </b><MultiSelect
              options={this.state.categoryCategories}
              value={this.state.categorySelection}
              onChange={this.setSelected}
              labelledBy="Select"
            />
          </div>
          <br />
          <IngredientNurtitionFacts onUpdate={this.updateNutritionFacts} facts={this.state.nutritionFacts}/>
          <IngredientImage onUpdate={this.updateImage} image={this.state.image} />
          <button onClick={this.addIngredient}>Add Ingredient</button>
        </div>
        <div className="ib fl">
          {ingredientPreview}
        </div>
          {latestAddedPreview}
       </div>
    );
  }
}
 export default IngredientNew;
