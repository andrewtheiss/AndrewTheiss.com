import React from 'react';
import Ingredients from '../Ingredients/Ingredients.js'

import BeanSelection from './Selections/Bean.js'
import IngredientSelection from './Selections/Ingredient.js'
import IngredientDetails from './Selections/Details.js'

const CHOCOLATE_DEFAULTS = {
  beans : [],
  Sweetener : [],
  Dairy : [],
  Cocoa : [],
  Other : []
}

class ChocolateIngredients extends React.Component {
  constructor(props) {
    super(props);
    this.onChangeBeans = this.onChangeBeans.bind(this);
    this.onChangeSelection = this.onChangeSelection.bind(this);
    this.state = {
      beans : [],
      Sweetener : [],
      Dairy : [],
      Cocoa : [],
      Other : [] };
  }
  onChangeBeans(beans) {
    this.setState({beans});
    console.log('Beans state changed', beans);
    this.props.onChange(this.state);
  }
  onChangeSelection(selectionType, values) {
    this.setState({[selectionType]:values});
    this.props.onChange(this.state);
  }
  render() {
    return (
      <div>
        <BeanSelection input={this.state.beans} name="beans" onChangeBean={this.onChangeBeans} />
        <IngredientSelection input={this.state.Dairy} name="Dairy" onChangeSelection={this.onChangeSelection} />
        <IngredientSelection input={this.state.Sweeteners} name="Sweetener" onChangeSelection={this.onChangeSelection} />
        <IngredientSelection input={this.state.Cocoa} name="Cocoa" onChangeSelection={this.onChangeSelection} />
        <IngredientSelection input={this.state.Other} name="Other" onChangeSelection={this.onChangeSelection} />
        <IngredientDetails input={this.state.details} name="Details" onChangeDetails={this.onChangeDetails} />
      </div>
    );
  }
}

export default ChocolateIngredients;

//
