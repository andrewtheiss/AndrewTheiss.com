import React from 'react';
import { FirebaseContext } from '../../../Firebase';
import AddNewIngredientPage from './AddNew.js'

class IngredientPage extends React.Component {
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
    let toggleAddNewIgredientHiddenClass = (this.state.showAddNewIngredient === true) ? 'ingredientPageAddIngredientContainer' : 'ingredientPageAddIngredientContainer hidden';

    return (
      <div>
        <h1></h1>
        <div className="ingredientPageAddIngredientViewToggle">
          <button onClick={this.toggleAddNewIgredient} className="ingredientPageToggleIngredientView">{toggleAddNewIgredient}</button>
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

export default IngredientPage;
