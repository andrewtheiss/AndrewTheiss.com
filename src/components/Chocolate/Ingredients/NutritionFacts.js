import React from 'react';
import * as CONSTS from './constants.js'

/**
 *  IngredientNurtitionFacts
 *
 *  Input:
 *  facts :     variable  current nutritionFacts state from parent
 *  onUpdate :  function  to update parent state
 */
class IngredientNurtitionFacts extends React.Component {
  constructor(props) {
    super(props);
    this.renderNutritionFacts = this.renderNutritionFacts.bind(this);
    this.onUpdate = this.onUpdate.bind(this);
    console.log(props);
    this.state = CONSTS.NUTRITION_FACTS;
    this.selectedBean = {};
    this.previewBean = {};
  }

  // Update values in this component and set in parent
  async onUpdate(event) {
    await this.setState({[event.target.name]: event.target.value});
    await this.props.onUpdate(this.state);
  }

  renderNutritionFacts() {
    let self = this;
    let factsForm = Object.keys(this.state).map((key) => (
      <div key={CONSTS.NUTRITION_LABEL_STRINGS[key]} >
        <b>{CONSTS.NUTRITION_LABEL_STRINGS[key]}: </b><input name={key} value={self.state[key]} type="text" onChange={this.onUpdate}></input>
      </div>
    ));
    return factsForm;
  }

  render() {
    const factsForm = this.renderNutritionFacts();
    return (
      <div key="nutritionFactsForm">
        {factsForm}
      </div>
    );
  }
}
 export default IngredientNurtitionFacts;
