import React from 'react';
import  * as CONSTS from './constants.js'
import NutritionFactsPreview from './NutritionFactsPreview.js'
/**
 *  NutritionCalculator
 *
 *  Calculator will continually re-calculate the running total of nutrition facts
 */

class NutritionCalculator extends React.Component {
  constructor(props) {
    super(props);
    console.log('nutritionFactsProps' , props);
    this.recalculateTotal = this.recalculateTotal.bind(this);
    this.normalizeAndAddToTotal = this.normalizeAndAddToTotal.bind(this);

    this.state = {
      individualItems : {},
      total : {},
      ingredients : []
    };
    this.temporaryNutritionTotal = CONSTS.NUTRITION_FACTS;
  }

  componentDidMount() {
    const IngredientCollectionRef = this.props.firebase.db.collection("ingredients");
    let self = this;
    IngredientCollectionRef.get().then(function(IngredientCollectionDocs) {
      var ingredients = {};
      IngredientCollectionDocs.forEach(function(doc) {
        ingredients[doc.id] = doc.data();
      });

      self.setState({
        ingredients : ingredients
      });
    });
  }


  normalizeAndAddToTotal(id, weightInGrams) {
    let self = this;
    if (this.state.ingredients[id] !== undefined) {
      let ingredientNutritionFacts = this.state.ingredients[id].nutritionFacts;
      let multiplierForPer100GramConversion = 100 / ingredientNutritionFacts.servingSizeInGrams;
      for (const [key, value] of Object.entries(ingredientNutritionFacts)) {
        console.log(self.temporaryNutritionTotal[key], key, value, multiplierForPer100GramConversion, weightInGrams);

        if (!self.temporaryNutritionTotal[key]) {
          self.temporaryNutritionTotal[key] = 0;
        }

        self.temporaryNutritionTotal[key] = Number(self.temporaryNutritionTotal[key]) + (weightInGrams * Number(value) / ingredientNutritionFacts.servingSizeInGrams);
      }
      // Loop through each object and add to summary
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
    for (const key in this.temporaryNutritionTotal) {
      this.temporaryNutritionTotal[key] = 0;
    }

    if (this.props.ingredients.values !== undefined) {
      /*
      let objectKeysToCheck = ['Cocoa','Dairy','Details','Other','Sweetener'];
      for (var i = 0; i < objectKeysToCheck.length; i++) {
        let ingredientType = this.props.ingredients.values[objectKeysToCheck[i]];
        for (var j = 0; j < ingredientType.length; j++) {
          this.normalizeAndAddToTotal();
        }
      }
      */
      // Handle Beans separately
      let beans = this.props.ingredients.values['Beans'];
      for (let i = 0; i < beans.length; i++) {
        this.normalizeAndAddToTotal(CONSTS.BEAN_NUTRITION_DB_ID, beans[i].weightInKg * 1000);
      }
    }
    console.log(this.temporaryNutritionTotal);
    return this.temporaryNutritionTotal;
  }

  render() {
    let total = this.recalculateTotal();
    let nutritionFactsPreview = <NutritionFactsPreview previewData={total}/>;

    return (
      <div>
        Nutrition Facts Summary
        {nutritionFactsPreview}
      </div>
    );
  }
}

export default NutritionCalculator;
