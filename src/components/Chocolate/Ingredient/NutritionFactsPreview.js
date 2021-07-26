import React from 'react';
import * as CONSTS from './constants.js'


const Bold = (input) => (<b>{input.value}</b>);
const SpacingDiv = (spacingClass) => (<div className={spacingClass.value}></div>);
const DefaultDisclaimer = () => (
  <p key="nutritionFactsDefaultDisclaimer" className="nutritionFactsFooterDisclaimer">
    * The % Daily Value (DV) tells you how much a nutrient in
    a serving of food contributes to a daily diet, 200 calories
    a day is used for general nutrition advice.
  </p>
);
class AddedSugarDisclaimer extends React.Component {
  render() {
    return (  <p className="nutritionFactsFooterDisclaimer">
        1 One servings adds {this.props.value}g of sugar to your diet and
        represents {Math.round(this.props.pct*10)/10}% of the Daily Value for Added Sugars.
      </p>
    )
  }
};

/**
 *  IngredientImage
 *
 *  Input:
 *  onUpdateImage :  function  to update parent state
 */
class NutritionFactsSingleRow extends React.Component {
  render() {
    let id = CONSTS.NUTRITION_LABEL_STRINGS[this.props.dataKey];
    let spacingClass = "nutritionFactsTabSpacing" + this.props.indentAmount;
    let spacingDiv = <SpacingDiv value={spacingClass} />;

    if (this.props.indentAmount <= 0) {
      id = <Bold value={id}  />;
    }
    let units = (CONSTS.NUTRITION_MESUREMENTS[this.props.dataKey] === undefined) ? 'g' : CONSTS.NUTRITION_MESUREMENTS[this.props.dataKey];
    let dailyRecommendedAmount = CONSTS.NUTRITION_RECOMMENDED_DAILY_AMOUNT[this.props.dataKey];
    let dailyRecommendedPercentValue = 100 * (Number(this.props.value) / Number(dailyRecommendedAmount));
    if (isNaN(dailyRecommendedPercentValue)) {
      dailyRecommendedPercentValue = 0;
    }
    let percent = <Bold value={Math.round(dailyRecommendedPercentValue) + '%'} />;
    if (CONSTS.NUTITION_FACTS_HIDE_PERCENT[this.props.dataKey]) {
      percent = '';
    }

    // Secondary values only render if they are non-zero or exsit
    // Also secondary values (displayed on the lower 1/2 of the label) are not bold
    if (this.props.secondary === true) {
      if (this.props.value === undefined || this.props.value === 0) {
        return '';
      }
      percent = Math.round(dailyRecommendedPercentValue) + '%';
    }

    // Otherwise render if they exist
    return (
      <div className="nutritionFactsSingleRow">
        {spacingDiv}<div className="nutritionFactsIb">{id} {this.props.value}{units}</div>
        <div className="nutritionFactsIb right">{percent}</div>
      </div>
    )
  }
}


class NutritionFactsPreview extends React.Component {
  constructor(props) {
    super(props);
    this.generatePrimaryDetails = this.generatePrimaryDetails.bind(this);
    this.generateSecondaryDetails = this.generateSecondaryDetails.bind(this);
    this.generateSecondaryDetailsBuffer = this.generateSecondaryDetailsBuffer.bind(this);
    this.generateSugarFooterDisclaimer = this.generateSugarFooterDisclaimer.bind(this);

    // Super hacky way to get dynamically expanding 100% width to adjust for textwrap
    let id = Math.floor(Math.random() * 1000000);
    this.uniqueId = 'nutritionFactsPreview_' + id;
    this.footerUniqueId = 'nutritionFactsPreviewFooter_' + id;
  }

  generatePrimaryDetails() {
    const primaryDetails = CONSTS.NUTRITION_FACTS_PRIMARY_DETAILS_ORDER_AND_TAB_INDENT;
    let details = Object.keys(primaryDetails).map((key) => (
      <NutritionFactsSingleRow key={key + "" + this.props.previewData[key]} dataKey={key} indentAmount={primaryDetails[key]} value={this.props.previewData[key]}/>
    ))
    return details;
  }

  generateSecondaryDetailsBuffer() {
    const secondaryDetails = CONSTS.NUTRITION_FACTS_SECONDARY_ITEMS;
    let hasSecondaryDetails = '';
    for (const key of Object.entries(secondaryDetails)) {
      if (this.props.previewData[key[0]]) {
        hasSecondaryDetails = <div className="nutritionFactsLargeBarDivider"></div>;
      }
    }
    return hasSecondaryDetails;
  }
  generateSecondaryDetails() {
    const secondaryDetails = CONSTS.NUTRITION_FACTS_SECONDARY_ITEMS;
    let details = Object.keys(secondaryDetails).map((key) => (
      <NutritionFactsSingleRow secondary={true} key={key + "" + this.props.previewData[key]} dataKey={key} indentAmount={secondaryDetails[key]} value={this.props.previewData[key]}/>
    ))
    return details;
  }

  generateDefalutFooterDisclaimer() {
    let footerDisclaimer = <DefaultDisclaimer />;
    return footerDisclaimer;
  }

  generateSugarFooterDisclaimer() {
    let footerDisclaimer = <div></div>;
    if (this.props.previewData['addedSugars'] > 0) {
      let dailyRecommendedAmount = CONSTS.NUTRITION_RECOMMENDED_DAILY_AMOUNT['addedSugars'];
      let dailyRecommendedPercentValue = 100 * (Number(this.props.previewData['addedSugars']) / Number(dailyRecommendedAmount));
      footerDisclaimer = <AddedSugarDisclaimer value={this.props.previewData['addedSugars']}  pct={dailyRecommendedPercentValue} />;
    }
    return footerDisclaimer;
  }

  componentDidUpdate() {
  document.getElementById(this.footerUniqueId).style.maxWidth = 5 + "px";
    let nutritionFactsRenderedDynamicWidth = document.getElementById(this.uniqueId).getBoundingClientRect().width;
    let finalWidth = Math.round(nutritionFactsRenderedDynamicWidth - 5);
    document.getElementById(this.footerUniqueId).style.maxWidth = finalWidth + "px";
  }

  render() {
    let servingSizeSingularOrPlural = (this.props.previewData.servingsPerContainer === "1") ? 'serving' : 'servings';
    let servingAmountSingularOrPlural = (this.props.previewData.servingSizeInGrams === "1") ? 'gram' : 'grams';
    let primaryDetails = this.generatePrimaryDetails();
    let secondaryDetailsBuffer = this.generateSecondaryDetailsBuffer();
    let secondaryDetails = this.generateSecondaryDetails();
    let sugarDisclaimer = this.generateSugarFooterDisclaimer();
    return (
      <div id={this.uniqueId} className="nutritionFactsOutline">
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
          <div className="nutritionFactsSingleRow">
            <div className="nutritionFactsPctDailyValues">
            % Daily Value*
            </div>
            <div className="nutritionFactsPrimaryDetails"></div>
          </div>

          {primaryDetails}
        </div>
        {secondaryDetailsBuffer}
        <div className="nutritionFactsSecondaryDetails">
          {secondaryDetails}
        </div>
        <div className="nutritionFactsMediumBarDivider t2"></div>
        <div id={this.footerUniqueId} className="nutirionFactsFooterWrapper">
        {this.generateDefalutFooterDisclaimer()}
        {sugarDisclaimer}
        </div>
        <div className="nutirionFactsFooterFinal"></div>
      </div>
    );
  }
}
 export default NutritionFactsPreview;
