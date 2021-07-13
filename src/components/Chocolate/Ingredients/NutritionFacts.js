import React from 'react';
import * as CONSTS from './constants.js'

class IngredientNurtitionFacts extends React.Component {
  constructor(props) {
    super(props);

    this.state = {

      caloriesPerServing : 0,
      caloriesPerGram : 0,

      servingsPerContainer : 1,
      servingSizeInGrams: 0,
      caloriesPerServing : 0,
      caloriesPerGram : 0,

      // All items in Grams unless otherwise stated
      totalFat : 0,
      saturageFat : 0,
      tarnsFat : 0,
      cholesterol : 0,
      sodium : 0,
      totalCarbohydrates : 0,
      dietaryFiber : 0,
      totalSugars : 0,
      Protein : 0,
      Calcium : 0,
      Iron : 0,
      Potassium : 0,
      VitaminD : 0,
      G : 0,

    };
    this.selectedBean = {};
    this.previewBean = {};
  }

  render() {
    return "<div>Ingredient </div>";
  }
}
 export default IngredientNurtitionFacts;
