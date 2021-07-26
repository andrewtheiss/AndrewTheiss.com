import React from 'react';
import AddNewIngredientPage from '../Ingredient/Pages/AddNew.js'

import BeanSelection from './Selections/Bean.js'
import Ingredientelection from './Selections/Ingredient.js'
import IngredientDetails from './Selections/Details.js'
import BeanSummary from './Selections/BeanSummary.js'

const CHOCOLATE_DEFAULTS = {
  Beans : [],
  Sweetener : [],
  Dairy : [],
  Cocoa : [],
  Other : [],
  Details : []
}

class ChocolateIngredients extends React.Component {
  constructor(props) {
    super(props);
    this.onAddBean = this.onAddBean.bind(this);
    this.onChangeSelection = this.onChangeSelection.bind(this);
    this.onChangeDetails = this.onChangeDetails.bind(this);
    this.onRemoveBean = this.onRemoveBean.bind(this);
    this.state = CHOCOLATE_DEFAULTS;
  }
  onAddBean(newBean) {
    var Beans = this.state.Beans;
    Beans.push(newBean);
    this.setState({Beans});
    this.props.onChange(this.state);
  }
  onChangeSelection(selectionType, values) {
    this.setState({[selectionType]:values});
    this.props.onChange(this.state);
  }
  onChangeDetails(details) {
    this.setState({Details:details});
    this.props.onChange(this.state);
  }
  onRemoveBean(beanIndex) {
    var Beans = this.state.Beans;
    Beans.splice(Number(beanIndex), 1);
    this.setState({Beans});
  }
  render() {
    var beanSummaryViewer = <BeanSummary input={this.state.Beans} name="Bean Viewer" onRemoveBean={this.onRemoveBean} onEditBean={this.onEditBean}/>;

    return (
      <div>
        <BeanSelection name="beans" onAddBean={this.onAddBean} />
        {beanSummaryViewer}
        <Ingredientelection input={this.state.Dairy} name="Dairy" onChangeSelection={this.onChangeSelection} />
        <Ingredientelection input={this.state.Sweeteners} name="Sweetener" onChangeSelection={this.onChangeSelection} />
        <Ingredientelection input={this.state.Cocoa} name="Cocoa" onChangeSelection={this.onChangeSelection} />
        <Ingredientelection input={this.state.Other} name="Other" onChangeSelection={this.onChangeSelection} />
        <IngredientDetails input={this.state.details} name="Details" onChangeDetails={this.onChangeDetails} />
      </div>
    );
  }
}

export default ChocolateIngredients;

//
