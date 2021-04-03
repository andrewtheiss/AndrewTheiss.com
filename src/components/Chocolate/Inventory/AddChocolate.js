import React from 'react';
import Ingredients from '../Ingredients/Ingredients.js'

import BeanSelection from './Selections/Bean.js'

const CHOCOLATE_DEFAULTS = {
  beans : [],
  sweeteners : [],
  dairy : [],
  other : []
}

class AddChocolate extends React.Component {
  constructor(props) {
    super(props);
    this.onChangeBeans = this.onChangeBeans.bind(this);
    this.state = { CHOCOLATE_DEFAULTS };
  }
  onChangeBeans(beans) {
    this.setState({beans});
    console.log('beans state changed', beans);
  }
  render() {
    return (
      <div>
        <BeanSelection input={this.state.beans} name="beans" onChangeBean={this.onChangeBeans} />

      </div>
    );
  }
}

export default AddChocolate;
