import React from 'react';
import NutritionFactsPreview from './NutritionFactsPreview.js'
import './Ingredient.css'
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
            <img id="img" height="250" alt="" className="ingredientPreviewImage" src={this.props.ingredient.imageBase64}/>
            <div className="ingredientPreviewOverviewDetails">
              <div className="ingredientPreviewName ingredientPreviewLineItem"><b>{this.props.ingredient.name}</b></div>
              <div className="ingredientPreviewLineItem"><b>Origin:</b> {this.props.ingredient.origin}</div>
              <div className="ingredientPreviewLineItem"><b>Category:</b> {this.props.ingredient.category}</div>
              <div className="ingredientPreviewLineItem"><b>Item Weight:</b> {this.props.ingredient.totalGramWeightPerItem} grams</div>
              <div className="ingredientPreviewLineItem"><b>Total Purchased:</b> {this.props.ingredient.countPurchased}</div>
              <div className="ingredientPreviewLineItem"><b>Latest Price:</b> ${this.props.ingredient.latestPurchasePrice}</div>
              <div className="ingredientPreviewLineItem">{this.props.ingredient.purchased}</div>
              {notes}
            </div>
          </div>
          <div className="ib">
              {nutritionFactsPreview}
          </div>
      </div>
    );
  }
}
 export default IngredientPreview;
