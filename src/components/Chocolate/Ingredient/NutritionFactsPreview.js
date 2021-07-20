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
    let servingSizeSingularOrPlural = (this.props.previewData.servingsPerContainer > 1) ? 'servings' : 'serving';
    let servingAmountSingularOrPlural = (this.props.previewData.servingSizeInGrams === "1") ? 'gram' : 'grams';
    return (
      <div className="nutritionFactsOutline">
        <div className="nutritionFactsLabel">Nutrition Facts</div>
        <div className="nutritionFactsServingsPerContainer">{this.props.previewData.servingsPerContainer} {servingSizeSingularOrPlural} per container</div>
        <div className="nutritionFactsServingSizeLabel">Serving Size </div>
        <div className="nutritionFactsServingSizeAmount">{this.props.previewData.servingSizeInGrams} {servingAmountSingularOrPlural}</div>
        <div className="nutritionFactsLargeBarDivider"></div>
        <div className="nutritionFactsCloriesContainer">
        <div className="nutritionFactsCaloriesNumber">{this.props.previewData.calories}</div>
          <div className="nutritionFactsAmountPerServing">Amount Per Serving</div>
          <div className="nutritionFactsCalories">Calories</div>
        </div>
        <div className="nutritionFactsPrimaryDetails">
        test
        </div>
      </div>
    );
  }
}
 export default NutritionFactsPreview;
