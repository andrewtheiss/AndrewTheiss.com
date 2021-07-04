import React from 'react';
import * as CONSTS from '../constants.js'


class IngredientWeight extends React.Component {
  constructor(props) {
    super(props);
    this.changeValue = this.changeValue.bind(this);
    this.onUpdateIngredientWeight = this.onUpdateIngredientWeight.bind(this);
    this.state = {
      label : this.props.label,
      doc : this.props.doc,
      value : this.props.value,
      weight : this.props.weight
    }
  }

  async changeValue(event) {
    await this.setState({weight : event.target.value});
    this.onUpdateIngredientWeight();
  }
  onUpdateIngredientWeight() {
    this.props.onUpdateIngredientWeight(this.state.doc, this.state.weight);
  }
  render() {
    return (
      <div>
          <label htmlFor="item"> {this.props.label}: </label>
          <input
           size="7"
           name={this.state.doc}
           value={this.state.weight}
           onChange={this.changeValue}
           type="text"
         /> (g)
         </div>
    );
  }
}

export default IngredientWeight;
