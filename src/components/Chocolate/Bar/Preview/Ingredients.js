import React from 'react';
import '../Bar.css'
import FlavorProfilePreview from '../../Bean/FlavorProfilePreview.js'
import * as CONSTS from '../../Bean/constants.js'

// Props are:  ingredients, beans
class PreviewIngredients extends React.Component {
  constructor(props) {
    super(props);
    this.generateIngredientsList = this.generateIngredientsList.bind(this);
    this.beanMap = {};

    this.dimensions = {
      width: 320,
      height: 300
    };
  }

    generateIngredientsList() {
      let self = this;
      if (!this.props.ingredients || Object.keys(this.props.ingredients).length < 1) {
        return <div></div>
      }

      let ingredients = JSON.parse(JSON.stringify(this.props.ingredients));
      for (var index in ingredients) {
        if (Math.round(ingredients[index]) > 1) {
          ingredients[index] = Math.round(ingredients[index]);
        }

        if (this.props.beans[index]) {
          let newBeanId = "Chocolate Bean: " + this.props.beans[index].displayLabel;
          this.beanMap[newBeanId] = this.props.beans[index];
          let value = ingredients[index];
          delete ingredients[index];
          ingredients[newBeanId] = value;
        }
      }


      let ingredientsList = Object.keys(ingredients).map((key) => {
        return self.beanMap[key] ?
          <div key={key} className="barPreviewIngredientsContainerSingleIngredient">{key}: <b>{Math.round(ingredients[key] * 100) / 100}g</b>
            <b className=""></b>
            <FlavorProfilePreview bean={{flavorArrays : CONSTS.GetFlavorProfileAsArrays(self.beanMap[key].flavorProfile)}} dimensions={self.dimensions} key="b3" />
            {console.log(CONSTS.GetFlavorProfileAsArrays(self.beanMap[key].flavorProfile))}
          </div>
          :
          <div key={key} className="barPreviewIngredientsContainerSingleIngredient">{key}: <b>{Math.round(ingredients[key] * 100) / 100}g</b>
            <b className=""></b>
          </div>
      });

      return ingredientsList;
    }


  render() {
    let ingredientsList = this.generateIngredientsList();
    return (
      <div className="barPreviewIngredientsContainer">
        <b>Ingredients:</b>
        <br />
        {ingredientsList}
        <div>
          {JSON.stringify(this.beanList)}
        </div>
      </div>
    )
  }
}

export default PreviewIngredients;
