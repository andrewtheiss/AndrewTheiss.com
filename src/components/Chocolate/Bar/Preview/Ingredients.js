import React from 'react';
import '../Bar.css'
import FlavorProfilePreview from '../../Bean/FlavorProfilePreview.js'
import * as CONSTS from '../../Bean/constants.js'

// Props are:  ingredients, beans
class PreviewIngredients extends React.Component {
  constructor(props) {
    super(props);
    this.generateIngredientsList = this.generateIngredientsList.bind(this);
    this.generateHighlightedIngredientsList = this.generateHighlightedIngredientsList.bind(this);
    this.beanMap = {};

    this.dimensions = {
      width: 220,
      height: 200
    };
    this.splitIngredients = {};
  }

  generateIngredientsList() {
    let self = this;
    let chocolateBeanString = "Chocolate Bean: ";
    if (!this.props.ingredients || Object.keys(this.props.ingredients).length < 1) {
      return <div></div>
    }

    let ingredients = JSON.parse(JSON.stringify(this.props.ingredients));
    for (var i in ingredients) {
      if (Math.round(ingredients[i]) > 1) {
        ingredients[i] = Math.round(ingredients[i]);
      }
    }

    // We want to SORT the order of ingredients but always have the Cacao Beans on the bottom
    let ingredientListKeys = Object.keys(ingredients).sort();
    for (var index in ingredients) {
      if (this.props.beans[index]) {
        let newBeanId = chocolateBeanString + this.props.beans[index].displayLabel;
        this.beanMap[newBeanId] = this.props.beans[index];
        let value = ingredients[index];
        delete ingredients[index];
        ingredients[newBeanId] = value;

        // remove cacao bean from the keys array (once again, this is happening here so that we may
        // keep other ingredients FIRST and in alpha order)
        let listIndex = ingredientListKeys.indexOf(index);
        if (listIndex > -1) {
          ingredientListKeys.splice(listIndex, 1);
        }
        ingredientListKeys.push(newBeanId);
      }
    }

    // Split the highlighted ingredients if they exist
    if (this.props.highlightType && this.props.highlightType.type && this.props.ingredientsListForHighlightType) {
      this.splitIngredients = {};
      for (index in ingredients) {
        if (this.props.ingredientsListForHighlightType[index]) {
          if (this.props.ingredientsListForHighlightType[index].category === this.props.highlightType.type) {
            this.splitIngredients[index] = ingredients[index];
            let listIndex = ingredientListKeys.indexOf(index);
            if (listIndex > -1) {
              ingredientListKeys.splice(listIndex, 1);
            }
            delete ingredients[index];
          }
        } else if (this.props.highlightType.type === "Cacao" && index.indexOf(chocolateBeanString) > -1) {
            this.splitIngredients[index] = ingredients[index];
            let listIndex = ingredientListKeys.indexOf(index);
            if (listIndex > -1) {
              ingredientListKeys.splice(listIndex, 1);
            }
            delete ingredients[index];
        }
      }
    }
    let ingredientsList = ingredientListKeys.map((key) => {
      return self.beanMap[key] ?
        <div key={key} className="barPreviewIngredientsContainerSingleIngredient">{key}: <b>{Math.round(ingredients[key] * 100) / 100}g</b>
          <b className=""></b>
          <FlavorProfilePreview bean={{flavorArrays : CONSTS.GetFlavorProfileAsArrays(self.beanMap[key].flavorProfile)}} preview={true} dimensions={self.dimensions} key="b3" />
        </div>
        :
        <div key={key} className="barPreviewIngredientsContainerSingleIngredient">{key}: <b>{Math.round(ingredients[key] * 100) / 100}g</b>
          <b className=""></b>
        </div>
    });

    return ingredientsList;
  }


  generateHighlightedIngredientsList() {
    let self = this;
    if (!this.props.highlightType || !this.props.highlightType.type || !this.props.ingredientsListForHighlightType) {
      return <div></div>
    }
    let ingredientsList = Object.keys(this.splitIngredients).map((key) => {
      return self.beanMap[key] ?
        <div key={key} className="barPreviewIngredientsContainerSingleIngredient highlighted">{key}: <b>{Math.round(self.splitIngredients[key] * 100) / 100}g</b>
          <b className=""></b>
          <FlavorProfilePreview bean={{flavorArrays : CONSTS.GetFlavorProfileAsArrays(self.beanMap[key].flavorProfile)}}  preview={true} dimensions={self.dimensions} key="b3" />
        </div>
        :
        <div key={key} className="barPreviewIngredientsContainerSingleIngredient highlighted">{key}: <b>{Math.round(self.splitIngredients[key] * 100) / 100}g</b>
          <b className=""></b>
        </div>
    });

    return ingredientsList;
  }



  render() {
    let ingredientsList = this.generateIngredientsList();
    let highlightedIngredientsList = this.generateHighlightedIngredientsList();
    return (
      <div className="barPreviewIngredientsContainer">
        <b>Ingredients Per Bar:</b>
        <br />
        {highlightedIngredientsList}
        {ingredientsList}
        <div>
        </div>
      </div>
    )
  }
}

export default PreviewIngredients;
