import React from 'react';
import '../Bar.css'

// Props are:  ingredients, beans
class PreviewIngredients extends React.Component {
  constructor(props) {
    super(props);
    this.generateIngredientsList = this.generateIngredientsList.bind(this);
    this.beanList = [];
  }

    generateIngredientsList() {
      if (!this.props.ingredients || Object.keys(this.props.ingredients).length < 1) {
        return <div></div>
      }

      let ingredients = JSON.parse(JSON.stringify(this.props.ingredients));
      for (var index in ingredients) {
        if (Math.round(ingredients[index]) > 1) {
          ingredients[index] = Math.round(ingredients[index]);
        }

        if (this.props.beans[index]) {
          this.beanList.push(index);
          let value = ingredients[index];
          delete ingredients[index];
          ingredients["Chocolate Bean: " + this.props.beans[index].displayLabel] = value;
        }
      }

      return Object.keys(ingredients).map((key) => (
        <div key={key} className="barPreviewIngredientsContainerSingleIngredient">{key}: <b>{Math.round(ingredients[key] * 100) / 100}g</b>
          <b className=""></b>
          {console.log(key)}
        </div>
      ))
    }

  render() {
    let ingredientsList = this.generateIngredientsList();
    return (
      <div className="barPreviewIngredientsContainer">
        <b>Ingredients:</b>
        <br />
        {ingredientsList}
        <div>
          Bean Spider Chart
          {JSON.stringify(this.beanList)}
        </div>
      </div>
    )
  }
}

export default PreviewIngredients;
