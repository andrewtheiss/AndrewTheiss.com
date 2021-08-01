import React from 'react';
import * as BATCH_CONSTS from '../Batch/constants.js'
/**
 *  CostCalculator
 *
 *  Calculator will continually re-calculate the running total ingredient cost
 */

class CostCalculator extends React.Component {
  constructor(props) {
    super(props);
    this.recalculateTotal = this.recalculateTotal.bind(this);
    this.addToRunningTotal = this.addToRunningTotal.bind(this);
    this.totalIngredientCost = 0;
  }

  addToRunningTotal(id, beanWeightInGrams) {
    if (this.props.ingredientsDb[id] !== undefined) {
      let ingredientPricePerKg = this.props.ingredientsDb[id].latestPricePerKg;
      this.totalIngredientCost += (ingredientPricePerKg / 1000) * beanWeightInGrams;
    }
  }

  recalculateTotal() {
    this.totalIngredientCost = 0;

    if (this.props.selectedIngredients.values !== undefined) {

      let objectKeysToCheck = BATCH_CONSTS.NON_BEAN_INGREDIENT_CATEGORIES;
      for (var i = 0; i < objectKeysToCheck.length; i++) {
        let ingredientType = this.props.selectedIngredients.values[objectKeysToCheck[i]];
        if (ingredientType !== undefined) {
          for (var j = 0; j < ingredientType.length; j++) {
            this.addToRunningTotal(ingredientType[j].label, ingredientType[j].weight);
          }
        }
      }

      // Handle Beans separately
      let beans = this.props.selectedIngredients.values['Beans'];
      if (beans !== undefined) {
        for (let i = 0; i < beans.length; i++) {
          this.totalIngredientCost += (beans[i].pricePerKilogram / 1000) * beans[i].beanWeightInGrams;
        }
      }
    }

    this.totalIngredientCost = Math.round(this.totalIngredientCost * 100)/100;

    // Update Parent Weight
    if (this.props.onUpdateTotalCost !== undefined) {
      this.props.onUpdateTotalCost(this.totalIngredientCost);
    }

    return this.totalIngredientCost;
  }

  render() {
    let totalCost = this.recalculateTotal();

    return (
      <div>
        Total Cost: ${totalCost}
      </div>
    );
  }
}

export default CostCalculator;
