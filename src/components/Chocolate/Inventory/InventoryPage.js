import React from 'react';
import { FirebaseContext } from '../../Firebase';
import AddNewIngredientPage from '../Ingredient/Pages/AddNew.js'
import AddNewChocolatePage from '../Chocolate/Pages/AddNew.js'

class InventoryPage extends React.Component {
  constructor(props) {
    super(props);
    this.toggleAddNewIgredient = this.toggleAddNewIgredient.bind(this);

    this.state = {
      showAddNewIngredient : false
    }
  }

  toggleAddNewIgredient() {
    let showAddNewIngredient = !this.state.showAddNewIngredient;
    this.setState({showAddNewIngredient});
  }

  render() {
    let toggleAddNewIgredient = (this.state.showAddNewIngredient === true) ? 'Hide Add New Ingredient' : 'Show Add New Ingredient';
    let toggleAddNewIgredientHiddenClass = (this.state.showAddNewIngredient === true) ? 'inventoryPageAddIngredientContainer' : 'inventoryPageAddIngredientContainer hidden';

    return (
      <div>
        <h1></h1>
        <FirebaseContext.Consumer>
          {firebase => <AddNewChocolatePage firebase={firebase} />}
        </FirebaseContext.Consumer>

        <div className="inventoryPageAddIngredientViewToggle">
          <button onClick={this.toggleAddNewIgredient} className="inventoryPageToggleIngredientView">{toggleAddNewIgredient}</button>
          <div className={toggleAddNewIgredientHiddenClass}>
            <FirebaseContext.Consumer>
              {firebase => <AddNewIngredientPage firebase={firebase} />}
            </FirebaseContext.Consumer>
          </div>
        </div>
       </div>
    );
  }
}

export default InventoryPage;
