import React from 'react';
import * as CONSTS from './constants.js'


const Bold = (input) => (<b>{input.value}</b>);
const SpacingDiv = (spacingClass) => (<div className={spacingClass.value}></div>)
/**
 *  IngredientImage
 *
 *  Input:
 *  onUpdateImage :  function  to update parent state
 */
class NutritionFactsSingleRow extends React.Component {
  constructor(props) {
    super(props);
    console.log(props);
  }
  render() {
    let id = CONSTS.NUTRITION_LABEL_STRINGS[this.props.dataKey];
    let spacingClass = "nutritionFactsTabSpacing" + this.props.indentAmount;
    let spacingDiv = <SpacingDiv value={spacingClass} />;

    if (this.props.indentAmount <= 0) {
      id = <Bold value={id} />;
    }
    let indent = this.props.indentAmount;
    let units = (CONSTS.NUTRITION_MESUREMENTS[this.props.dataKey] === undefined) ? 'g' : CONSTS.NUTRITION_MESUREMENTS[this.props.dataKey];
    let percent = '0' + '%';
    if (CONSTS.NUTITION_FACTS_HIDE_PERCENT[this.props.dataKey]) {
      percent = '';
    }

    return (
      <div className="nutritionFactsSingleRow">
        {spacingDiv}<div className="nutritionFactsIb">{id} {this.props.value}{units}</div>
        <div className="nutritionFactsIb right"><b>{percent}</b></div>
      </div>
    )
  }
}


class NutritionFactsPreview extends React.Component {
  constructor(props) {
    super(props);
    this.generatePrimaryDetails = this.generatePrimaryDetails.bind(this);
  }

  generatePrimaryDetails() {
    console.log('prim det');
    const primaryDetails = CONSTS.NUTRITION_FACTS_PRIMARY_DETAILS_ORDER_AND_TAB_INDENT;
    const primaryDetailKeys = Object.keys(primaryDetails);
    let details = Object.keys(primaryDetails).map((key) => (
      <NutritionFactsSingleRow key={key + "" + this.props.previewData[key]} dataKey={key} indentAmount={primaryDetails[key]} value={this.props.previewData[key]}/>
    ))
    console.log(primaryDetailKeys);
    return details;
  }

  render() {
    console.log('render preview', this.props);
    let servingSizeSingularOrPlural = (this.props.previewData.servingsPerContainer === "1") ? 'serving' : 'servings';
    let servingAmountSingularOrPlural = (this.props.previewData.servingSizeInGrams === "1") ? 'gram' : 'grams';
    let primaryDetails = this.generatePrimaryDetails();
    console.log('got new primary details');
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
          {primaryDetails}
        </div>
        <div className="nutritionFactsSecondaryDetails">
          secondary details
        </div>
      </div>
    );
  }
}
 export default NutritionFactsPreview;
