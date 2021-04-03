import React from 'react';
import Ingredients from '../Ingredients/Ingredients.js'
import AddChocolate from './AddChocolate.js'

const InventoryPage = () => (
 <div>
   <h1></h1>
   <InventoryMenu />
 </div>
);

class InventoryMenu extends React.Component {

  render() {
    console.log(this.props);
    return (
      <div>
       <button>Add Chocolate</button>
       </div>
    );
  }
}

export default InventoryPage;
