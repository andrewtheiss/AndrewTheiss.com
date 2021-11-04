import React from 'react';
import PreviewIngredients from '../../Bar/Preview/Ingredients.js'
import PreviewPackagingSelection from '../../Bar/Preview/PackagingSelection.js'
import NutritionFactsPreview from '../../Ingredient/NutritionFactsPreview.js'
import TableRowWrapper from './TableRowWrapper.js'
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
    this.showAnswers = this.showAnswers.bind(this);
    this.generateDifficulty = this.generateDifficulty.bind(this);

    this.state = {
      tasting : {},
      ingredientsList : {},
      showAnswers : false
    }
  }

  async componentDidUpdate(prevProps) {
    if (this.props !== prevProps) {
      if (JSON.stringify(this.props.tastingId) !== JSON.stringify(prevProps.tastingId)) {

        let self = this;
        let tasting = {};
        const docRef = this.props.firebase.db.collection("tastingPublic").doc(this.props.tastingId);
        await docRef.get().then(function(doc) {
          if (doc.exists) {
            tasting = doc.data();
          }
          self.setState({tasting});
        });
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
    if (this.props.tastingId && (!this.props.tasting || Object.keys(this.props.tasting).length === 0)) {
      const docRef = this.props.firebase.db.collection("tastingPublic").doc(this.props.tastingId);
      await docRef.get().then(function(doc) {
        if (doc.exists) {
          tasting = doc.data();
        }
        self.setState({tasting});
      });
    } else {
        tasting = this.props.tasting;
        self.setState({tasting});
    }
  }

  generatePreviewForBars() {
    let barPreview = <div></div>;
    return barPreview;
  }

  generateBarComparisonImages() {
    let barPreview = <td></td>;
    let bars = this.state.tasting.bars;
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
    let bars = this.state.tasting.bars;
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
    let bars = this.state.tasting.bars;
    if (bars && Object.keys(bars).length > 0) {
      barPreview = Object.keys(bars).map((key) => (
        <td key={key} className="">
          <PreviewIngredients
          highlightType={self.state.tasting}
          ingredientsListForHighlightType={self.state.ingredientsList}
          ingredients={bars[key]['batchIngredients']}
          beans={bars[key]['beans']} />
        </td>
      ));
    }
    let barPreviewRow = <TableRowWrapper showAnswers={this.state.showAnswers} tableRowClass="tastingSideBySideIngredients" tastingType={this.state.tasting.type} type="Ingredients" tableData={barPreview} />;
    return barPreviewRow;
  }

  generateBarComparisonNutritionFacts() {
    let barPreview = <td></td>;
    let bars = this.state.tasting.bars;
    if (bars && Object.keys(bars).length > 0) {
      barPreview = Object.keys(bars).map((key) => (
        <td key={key}>
          <div className="tastingSideBySideBarNutritionFactsTd">
            <NutritionFactsPreview hideIngredientList={true} previewData={bars[key]['nutritionFacts']} ingredientList={bars[key]['ingredients']}/>
          </div>
        </td>
      ));
    }
    return barPreview;
  }

  generateDifficulty() {
    let barDifficulty = <div></div>;
    if (this.state.tasting.difficulty) {
      let className = "tastingDifficulty " + this.state.tasting.difficulty;
      barDifficulty = <div className="tastingDifficultyContainer"><div className={className}>{this.state.tasting.difficulty}</div></div>
    }
    return barDifficulty;
  }

  showAnswers() {
    this.setState({showAnswers: true});
  }

  render() {
    if (!this.state.tasting) {
      return <div></div>
    }
    let tastingDifficulty = this.generateDifficulty();
    let barImages = this.generateBarComparisonImages();
    let barPackaging = this.generateBarComparisonPackaging();
    let barIngredients = this.generateBarComparisonIngredients();
    let barNutritionFacts = this.generateBarComparisonNutritionFacts();
    let showAnswersShowHide = (this.state.showAnswers) ? " hidden" : "";
    let showAnswersCss = "tastingButtonContainer" + showAnswersShowHide;
    return (
      <div>
        <div>
          <h1 className="barTastingPreviewTitle">Difficulty: {tastingDifficulty}</h1>

          <h2  className="barTastingPreviewLabel">{this.state.tasting.label}</h2>
        </div>
        <div>
          <p className="tastingPreviewTitle">{this.state.tasting.notes}</p>
          <p className="tastingPreviewTitle minor">{this.state.tasting.notesMinor}</p>
          <div className={showAnswersCss}>
            <button className="tastingPreviewShowAnswersButton" onClick={this.showAnswers}>Show Answers</button>
          </div>
          <table  className="tastingSideBySideBarComparisonConainer">
          <tbody>
            <tr className="tastingSideBySideBarImages">
            {barImages}
            </tr>
            <tr className="barSideBySidePackagingTd">
            {barPackaging}
            </tr>
            {barIngredients}
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
