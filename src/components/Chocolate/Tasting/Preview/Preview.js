import React from 'react';
import PreviewIngredients from '../../Bar/Preview/Ingredients.js'
import PreviewPackagingSelection from '../../Bar/Preview/PackagingSelection.js'
import NutritionFactsPreview from '../../Ingredient/NutritionFactsPreview.js'
import '../../Bar/Bar.css'
/**
 *  TastingPreview
 *
 *  Input:
 *  bars      : array of bars with all data
 *  tastingId : optional we can give it a tasting ID and it can handle all dependencies
 *
 */
class TastingPreview extends React.Component {
  constructor(props) {
    super(props);
    this.generateBarComparisonImages = this.generateBarComparisonImages.bind(this);
    this.generateBarComparisonPackaging = this.generateBarComparisonPackaging.bind(this);
    this.generateBarComparisonIngredients = this.generateBarComparisonIngredients.bind(this);

    this.state = {
      tasting : {},
      ingredientsList : {}
    }
  }

  async componentDidUpdate(prevProps) {
    if (this.props !== prevProps) {
      if (JSON.stringify(this.props.tasting) !== JSON.stringify(prevProps.tasting)) {
        let tasting = this.props.tasting;
        this.setState({tasting});
      }
    }
  }

  async componentDidMount() {
    let self = this;

    // Get ingredients list
    const collectioRef = this.props.firebase.db.collection("ingredients");
    await collectioRef.get().then(function(collectionDocs) {
      var ingredientsList = {};
      collectionDocs.forEach(function(doc) {
        ingredientsList[doc.id] = doc.data();
      });

      self.setState({ingredientsList});
    });

    // If we give this a tastingId
    let tasting = {};
    if (this.props.tasting === {}) {
      const docRef = this.props.firebase.db.collection("tasting").doc(this.props.tastingId);
      await docRef.get().then(function(doc) {
        if (doc.exists) {
          tasting = doc.data();
        }
        self.setState({tasting});
      });
    } else {
        tasting = this.props.tasting;
        await self.setState({tasting});
    }
  }

  generatePreviewForBars() {
    let barPreview = <div></div>;
    return barPreview;
  }

  generateBarComparisonImages() {
    let barPreview = <td></td>;
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

  generateBarComparisonPackaging() {
    let barPreview = <td></td>;
    let bars = this.props.tasting.bars;
    if (bars && Object.keys(bars).length > 0) {
      barPreview = Object.keys(bars).map((key) => (
        <td key={key} className="">
          <PreviewPackagingSelection packagingSelection={bars[key]['packagingSelection']} />
        </td>
      ));
    }
    return barPreview;
  }

  generateBarComparisonIngredients() {
    let barPreview = <td></td>;
    let self = this;
    let bars = this.props.tasting.bars;
    if (bars && Object.keys(bars).length > 0) {
      barPreview = Object.keys(bars).map((key) => (
        <td key={key} className="">
          <PreviewIngredients
          highlightType={self.props.tasting}
          ingredientsListForHighlightType={self.state.ingredientsList}
          ingredients={bars[key]['batchIngredients']}
          beans={bars[key]['beans']} />
        </td>
      ));
    }
    return barPreview;
  }

  generateBarComparisonNutritionFacts() {
    let barPreview = <td></td>;
    let bars = this.props.tasting.bars;
    if (bars && Object.keys(bars).length > 0) {
      barPreview = Object.keys(bars).map((key) => (
        <td key={key}>
          <div className="tastingSideBySideBarNutritionFactsTd">
            <NutritionFactsPreview previewData={bars[key]['nutritionFacts']} ingredientList={bars[key]['ingredients']}/>
          </div>
        </td>
      ));
    }
    return barPreview;
  }

  render() {
    let barImages = this.generateBarComparisonImages();
    let barPackaging = this.generateBarComparisonPackaging();
    let barIngredients = this.generateBarComparisonIngredients();
    let barNutritionFacts = this.generateBarComparisonNutritionFacts();

    return (
      <div>
        <div>
          <h1 className="barTastingPreviewTitle">Bar Tasting:</h1>
          <h2  className="barTastingPreviewLabel">{this.props.tasting.label}</h2>
        </div>
        <div>
          <p className="tastingPreviewTitle">{this.props.tasting.notes}</p>
          <p className="tastingPreviewTitle minor">{this.props.tasting.notesMinor}</p>
          <table  className="tastingSideBySideBarComparisonConainer">
          <tbody>
            <tr className="tastingSideBySideBarImages">
            {barImages}
            </tr>
            <tr className="barSideBySidePackagingTd">
            {barPackaging}
            </tr>
            <tr className="tastingSideBySideBarImages">
            {barIngredients}
            </tr>
            <tr className="tastingSideBySideBarNutritionFacts">
            {barNutritionFacts}
            </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  }
}

export default TastingPreview;
