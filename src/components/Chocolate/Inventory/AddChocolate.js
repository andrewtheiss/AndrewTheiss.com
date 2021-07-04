import React from 'react';
import Ingredients from '../Ingredients/Ingredients.js'

import BeanSelection from './Selections/Bean.js'
import IngredientSelection from './Selections/Ingredient.js'

const CHOCOLATE_DEFAULTS = {
  beans : [],
  sweeteners : [],
  dairy : [],
  cocoa : [],
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
  onChangeDairy(dairy) {
    this.setState({dairy});
    console.log('dairy state changed', dairy);
  }
  onChangeSweetener(sweeteners) {
    this.setState({sweeteners});
    console.log('sweeteners state changed', sweeteners);
  }
  onChangeCocoa(cocoa) {
    this.setState({cocoa});
    console.log('cocoa state changed', cocoa);
  }
  onChangeOther(other) {
    this.setState({other});
    console.log('other state changed', other);
  }
  render() {
    return (
      <div>
        <BeanSelection input={this.state.beans} name="beans" onChangeBean={this.onChangeBeans} />
        <IngredientSelection input={this.state.dairy} name="Dairy" onChangeSelection={this.onChangeDairy} />
      </div>
    );
  }
}

export default AddChocolate;


/*

<IngredientSelection input={this.state.sweeteners} name="Sweetener" onChangeSelection={this.onChangeSweetener} />
<IngredientSelection input={this.state.cocoa} name="Cocoa" onChangeSelection={this.onChangeCocoa} />
<IngredientSelection input={this.state.other} name="Other" onChangeSelection={this.onChangeOther} />
*/
