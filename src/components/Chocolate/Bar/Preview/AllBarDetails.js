import React from 'react';
import '../Bar.css'
import PreviewPackagingSelection from './PackagingSelection.js'
import PreviewIngredients from './Ingredients.js'
import NutritionFactsPreview from '../../Ingredient/NutritionFactsPreview.js'



class PreviewAllBarDetails extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      bar : null
    };
  }


  // Get data from DB in this function
  async componentDidMount() {
    let self = this;

    if (this.props.barId) {
      const docRef = this.props.firebase.db.collection("barsPublic").doc(this.props.barId);
      await docRef.get().then(function(doc) {
        let bar = null;
        console.log(self.props.barId, doc.data());
        if (doc.exists) {
          bar = doc.data();
        }
        self.setState({bar});
      });
    }
  }


  render() {
    if (!this.state.bar) {
      return (<div>No bar found</div>)
    }

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

      </div>
    )
  }

}

export default PreviewAllBarDetails;
