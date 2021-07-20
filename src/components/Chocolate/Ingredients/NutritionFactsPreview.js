import React from 'react';
/**
 *  IngredientImage
 *
 *  Input:
 *  onUpdateImage :  function  to update parent state
 */
class NutritionFactsPreview extends React.Component {
  constructor(props) {
    super(props);
    console.log('nutritionFacts' , props);
  }

  render() {
    console.log('render preview', this.props);
    return (
      <div className="nutritionFactsOutline">
        <div className="nutritionFactsLabel">Nutrition Facts</div>
        <div>Serving Size grams</div>
        <div>Servings Per Container</div>
        <div className="amountPerServing">
          <div className="amountPerServingTitle">Amount Per Serving</div>
          <div className="cloriesContainer"></div>
          <div className="calories">Calories</div>
          <div className="caloriesNumber">{this.props.previewData.caloriesPerServing}</div>
          <div className="caloriesfromFat">Calories From Fat {this.props.previewData.caloriesFromFat}</div>
        </div>
        <div className="secondaryFacts">
        </div>
      </div>
    );
  }
}
 export default NutritionFactsPreview;
