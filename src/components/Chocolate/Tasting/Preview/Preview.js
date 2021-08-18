import React from 'react';
import PreviewIngredients from '../../Bar/Preview/Ingredients.js'
import PreviewPackagingSelection from '../../Bar/Preview/PackagingSelection.js'
import NutritionFactsPreview from '../../Ingredient/NutritionFactsPreview.js'
/**
 *  TastingPreview
 *
 *  Input:
 *  bars      : array of bars with all data
 *
 */
class TastingPreview extends React.Component {
  constructor(props) {
    super(props);
    this.generateBarComparisonImages = this.generateBarComparisonImages.bind(this);

    this.state = {
      tasting : {}
    }
  }

  async componentDidUpdate(prevProps) {
    if (this.props !== prevProps) {

    }
  }

  generatePreviewForBars() {
    let barPreview = <div></div>;
    return barPreview;
  }

  generateBarComparisonImages() {
    let barPreview = <div></div>;
    let self = this;
    let bars = this.props.tasting.bars;
    if (bars && Object.keys(bars).length > 0) {
      barPreview = Object.keys(bars).map((key) => (
        <td key={key} className="">
          <img src={bars[key]['moldImageBase64']} alt="" className="barSideBySideBarImage" />
        </td>
      ));
    }
    return barPreview;
  }

  render() {
    let barImages = this.generateBarComparisonImages();
/*
  let packagingSelection = <PreviewPackagingSelection packagingSelection={this.state.bar.packagingSelection} />
  let ingredients = <PreviewIngredients ingredients={this.state.bar.batchIngredients} beans={this.state.bar.beans} />

  let nutritionFacts = (this.state.bar.nutritionFacts) ? this.state.bar.nutritionFacts : {};
  let nutritionFactsPreview = <NutritionFactsPreview previewData={nutritionFacts} ingredientList={this.state.bar.ingredients}/>;


  return(
    <div className="barPreviewContainer">
      <img src={this.state.bar.moldImageBase64} alt="This is what your bar should look like!" className="barPreviewMold" />
      <div className="barPreviewPackaging">{packagingSelection}</div>
      <div className="barPreviewIngredients">{ingredients}</div>
      <div className="barPreviewNutritionFacts">{nutritionFactsPreview}</div>

    */
    console.log(this.props);
    return (
      <div>
        <div>
          Bars to try:
          <p>You need to try the following bars and look for {this.props.notes}</p>
          <table  className="tastingSideBySideBarComparisonConainer">
            <tr className="tastingSideBySideBarImages">
            {barImages}
            </tr>
            <tr className="tastingSideBySideBarImages">
            {barImages}
            </tr>
          </table>
        </div>
      </div>
    );
  }
}

export default TastingPreview;
