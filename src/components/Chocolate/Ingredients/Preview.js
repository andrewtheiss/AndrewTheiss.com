import React from 'react';
import NutritionFactsPreview from './NutritionFactsPreview.js'
import './ingredients.css'
/**
 *  IngredientImage
 *
 *  Input:
 *  onUpdateImage :  function  to update parent state
 */
class IngredientPreview extends React.Component {
  constructor(props) {
    super(props);
    this.renderNotes = this.renderNotes.bind(this);
    console.log("ingredient preview" ,props);
  }

  renderNotes(notes) {
    if (notes === undefined || notes === '') {
      return (<div></div>);
    }
    return (<div className="inventoryNotes"><b>Notes:</b> {this.props.ingredient.notes}</div>);
  }

  render() {
    let notes = this.renderNotes(this.props.ingredient.notes);
    let nutritionFactsPreview = <NutritionFactsPreview previewData={this.props.ingredient.nutritionFacts}/>;
    return (
      <div key="ingredientPreview">
          <div className="ib">
            <div><b>{this.props.ingredient.name}</b></div>
            <div>Origin: {this.props.ingredient.origin}</div>
            <div>Type: {this.props.ingredient.category}</div>
            <div>${this.props.ingredient.costPerItem} average per item</div>
            <div>{this.props.ingredient.countPurchased} purchased so far</div>
            <div>Weight: {this.props.ingredient.totalGramWeightPerItem} grams</div>
            <div>Latest Price: ${this.props.ingredient.latestPurchasePrice}</div>
            <div>{this.props.ingredient.purchased}</div>
            {notes}
          </div>
          <div className="ib">
            <img id="img" height="150" src={this.props.ingredient.imageBase64}/>
          </div>
          <div className="ib">
              {nutritionFactsPreview}
          </div>
      </div>
    );
  }
}
 export default IngredientPreview;
