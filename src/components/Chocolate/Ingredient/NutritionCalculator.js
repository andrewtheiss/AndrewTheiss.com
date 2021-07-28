import React from 'react';
import  * as CONSTS from './constants.js'
import NutritionFactsPreview from './NutritionFactsPreview.js'
import CostCalculator from './CostCalculator.js'
import './Ingredient.css'
/**
 *  NutritionCalculator
 *
 *  Calculator will continually re-calculate the running total of nutrition facts
 *
 *  Two inputs :
        this.props.selectedIngredients (has selected ingredients)
        this.state.ingredientsDb (has ingredients inventory list)
 */

class NutritionCalculator extends React.Component {
  constructor(props) {
    super(props);
    this.recalculateTotal = this.recalculateTotal.bind(this);
    this.addToRunningTotal = this.addToRunningTotal.bind(this);
    this.onUpdateTotalCost = this.onUpdateTotalCost.bind(this);
    this.renderCostCalculator = this.renderCostCalculator.bind(this)
    this.generateOrderedIngredientList = this.generateOrderedIngredientList.bind(this);
    this.state = {
      ingredientsDb : {}
    };
    this.temporaryNutritionTotal = CONSTS.NUTRITION_FACTS;
    this.orderedIngredientList = [];
  }

  componentDidMount() {
    const IngredientCollectionRef = this.props.firebase.db.collection("ingredients");
    let self = this;
    IngredientCollectionRef.get().then(function(IngredientCollectionDocs) {
      var ingredientsDb = {};
      IngredientCollectionDocs.forEach(function(doc) {
        ingredientsDb[doc.id] = doc.data();
      });

      self.setState({
        ingredientsDb : ingredientsDb
      });
    });
  }

  addToRunningTotal(id, weightInGrams) {
    let self = this;
    if (this.state.ingredientsDb[id] !== undefined) {
      let ingredientNutritionFacts = this.state.ingredientsDb[id].nutritionFacts;
      for (const [key, value] of Object.entries(ingredientNutritionFacts)) {

        if (!self.temporaryNutritionTotal[key]) {
          self.temporaryNutritionTotal[key] = 0;
        }

        self.temporaryNutritionTotal[key] = Number(self.temporaryNutritionTotal[key]) + (weightInGrams * Number(value) / ingredientNutritionFacts.servingSizeInGrams);
      }
    }
  }

  saveNutritionFacts(id) {

  }

  loadNutritionFacts(id) {

  }

  // Sometimes I split the batch and do two different things with it (like change a single ingredient)
  //splitBatch() {}

  recalculateTotal() {
    this.temporaryNutritionTotal = CONSTS.NUTRITION_FACTS;
    this.orderedIngredientList = [];

    for (const key in this.temporaryNutritionTotal) {
      this.temporaryNutritionTotal[key] = 0;
    }

    if (this.props.selectedIngredients.values !== undefined) {

      let objectKeysToCheck = ['Cocoa','Dairy','Other','Sweetener'];
      for (var i = 0; i < objectKeysToCheck.length; i++) {
        let ingredientType = this.props.selectedIngredients.values[objectKeysToCheck[i]];
        for (var j = 0; j < ingredientType.length; j++) {
          this.addToRunningTotal(ingredientType[j].label, ingredientType[j].weight);
          if (this.state.ingredientsDb !== undefined && this.state.ingredientsDb[ingredientType[j].label] !== undefined) {
            this.orderedIngredientList.push({
              label : this.state.ingredientsDb[ingredientType[j].label].nutritionFactsIngredientLabel,
              quantity : ingredientType[j].weight
            });
          }
        }
      }

      // Handle Beans separately
      let beans = this.props.selectedIngredients.values['Beans'];
      for (let i = 0; i < beans.length; i++) {
        this.addToRunningTotal(CONSTS.BEAN_NUTRITION_DB_ID, beans[i].weightInGrams);
        this.orderedIngredientList.push({label : CONSTS.BEAN_NUTRITION_DB_ID, quantity : beans[i].weightInGrams});
      }
    }

    // Manually set some values and round others
    this.temporaryNutritionTotal["servingsPerContainer"] = 1;
    for (const key in this.temporaryNutritionTotal) {
      this.temporaryNutritionTotal[key] = Math.round(this.temporaryNutritionTotal[key]);
    }

    // Update Parent Weight
    if (this.props.onUpdateWeight !== undefined) {
      this.props.onUpdateWeight(this.temporaryNutritionTotal["servingSizeInGrams"]);
    }

    return this.temporaryNutritionTotal;
  }

  generateOrderedIngredientList() {
    let ingredientString = "Ingredients: ";

    // Consolidate Duplicates (for things like multiple beans to not show Cocoa Beans twice)
    let duplicateCheck = {};
    let duplicateFound = false;
    let index = this.orderedIngredientList.length;
    while(index--) {
      if (duplicateCheck[this.orderedIngredientList[index].label] === undefined) {
        duplicateCheck[this.orderedIngredientList[index].label] = Number(this.orderedIngredientList[index].quantity);
      } else {
        duplicateCheck[this.orderedIngredientList[index].label] += Number(this.orderedIngredientList[index].quantity);
        this.orderedIngredientList.splice(index,1);
        duplicateFound = true;
      }
    }
    if (duplicateFound) {
      index = this.orderedIngredientList.length;
      while(index--) {
        this.orderedIngredientList[index].quantity = duplicateCheck[this.orderedIngredientList[index].label];
      }
    }

    this.orderedIngredientList.sort(function(a,b){
      return b.quantity - a.quantity;
    });

    // Find boundary for ingredients which 'Contains 2% or less of the following:'
    let twoPercent = this.temporaryNutritionTotal["servingSizeInGrams"] * 0.02;
    let flaggedTwoPercent = false;

    // Render ingredient list sorted by ingredient weight
    for (var i = 0; i < this.orderedIngredientList.length; i++) {
      if (!flaggedTwoPercent && (this.orderedIngredientList[i].quantity < twoPercent)) {
        flaggedTwoPercent = true;
        ingredientString += 'Contains 2% or less of the following: ';
      }
      ingredientString += this.orderedIngredientList[i].label;
      if (i !== this.orderedIngredientList.length - 1) {
        ingredientString += ", ";
      } else {
        ingredientString += ".";
      }
    }
    return ingredientString;
  }

  // Optional if we want to calculate cost we can add a module which will pass it
  // through here.  This method already goes through ALL the data.
  onUpdateTotalCost(totalCost) {
    if (this.props.onUpdateTotalCost !== undefined) {
      this.props.onUpdateTotalCost(totalCost);
    }
  }

  renderCostCalculator() {
    if (Object.keys(this.state.ingredientsDb).length === 0) {
      return <div></div>;
    }
    return <CostCalculator ingredientsDb={this.state.ingredientsDb} selectedIngredients={this.props.selectedIngredients} onUpdateTotalCost={this.onUpdateTotalCost} />;
  }

  render() {
    let total = this.recalculateTotal();
    let nutritionFactsPreview = <NutritionFactsPreview previewData={total} overrideIngreientBox={true}/>;
    let costCalulation = this.renderCostCalculator();
    let orderedIngredientList = this.generateOrderedIngredientList();

    return (
      <div>
        <div className="nutritionCalculator">
          Nutrition Facts Summary
          {nutritionFactsPreview}
        </div>
        <div className="nutritionCalculatorIngredientsBox">
          {orderedIngredientList}
        </div>
        <div className="nutritionCalculatorCost">
          {costCalulation}
        </div>
      </div>
    );
  }
}

export default NutritionCalculator;
