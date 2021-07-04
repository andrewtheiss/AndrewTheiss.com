import React from 'react';
import Ingredients from '../Ingredients/Ingredients.js'
import ChocolateIngredients from './ChocolateIngredients.js'
import IngredientDetails from './Selections/Details.js'

const InventoryPage = () => (
 <div>
   <h1></h1>
   <InventoryMenu />
 </div>
);

class InventoryMenu extends React.Component {
  constructor(props) {
    super(props);
    this.addChocolate = this.addChocolate.bind(this);
    this.updateChocolate = this.updateChocolate.bind(this);
    this.formatChocolateFromState = this.formatChocolateFromState.bind(this);
  }

  addChocolate() {
    console.log('try and add chocolate', this.formatChocolateFromState());
  }

  formatChocolateFromState() {
    // Format Beans
    //
    return {};
  }

  updateChocolate(values) {
    console.log(values);
    this.setState({values});
  }

  render() {
    //console.log(this.props);
    return (
      <div>
        <ChocolateIngredients onChange={this.updateChocolate}/>
        <button onClick={this.addChocolate}>Add Chocolate</button>
       </div>
    );
  }
}

export default InventoryPage;
