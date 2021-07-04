import React from 'react';
import { withFirebase } from '../../../Firebase';
import IngredientWeight from './IngredientWeight.js'
import RoastFinal from './RoastFinal.js'
import * as CONSTS from '../constants.js'
import '../../Theme/main.css';
import MultiSelect from "react-multi-select-component";

class IngredientSelection extends React.Component {
  constructor(props) {
    super(props);

    // Find the prop of the ingredient selection
    console.log(props.name);
    this.state = {
      ingredientsMap : '',
      options : [],
      selected : []
    };

    this.setSelected = this.setSelected.bind(this);
    this.componentDidMount = this.componentDidMount.bind(this);
    this.renderSelectedIngredientsWeight = this.renderSelectedIngredientsWeight.bind(this);
    this.onUpdateIngredientWeight = this.onUpdateIngredientWeight.bind(this);
  }

  componentDidMount() {
    const ingredientsCollectionRef = this.props.firebase.db.collection("ingredients");
    let self = this;
    ingredientsCollectionRef.where("category", "==", this.props.name).get().then(function(ingredientsCollectionDocs) {
      var ingredientsMap = {};
      var options = [];
      ingredientsCollectionDocs.forEach(function(doc) {
      var ingWeight = (doc.data()['weight'] === undefined) ? 0 : doc.data()['weight'];
        ingredientsMap[doc.id] = doc.data();
        options.push({label:doc.data()['name'], value : doc.id, weight : ingWeight});
      });

      self.setState({
        ingredientsMap : ingredientsMap,
        options : options
      });
    });
  }

  // Set Selected Ingredients so we can update the value of their weight in grams
  setSelected(allSelectedItems) {
    this.setState({ selected : allSelectedItems});
  }

  /**
   *  renderSelectedIngredientsWeight
   *
   *  Check all selected ingredients of type and allow for value input
   */
  renderSelectedIngredientsWeight() {
    let selectedIngredientsWeights = '';
    let selected = this.state.selected;
    var self = this;
    let hasItems = !(!selected || selected.length == 0);
    if (hasItems) {

    // Creating a unique key forces re-render ONLY each time length is changed
      var rand = selected.length/3.14159;

      selectedIngredientsWeights = selected.map((ingredient, index) =>
        <IngredientWeight
           key={index + rand}
           label={selected[index].label}
           index={index}
           name={this.props.name}
           doc={ingredient['value']}
           roastIndex={index}
           weight={ingredient['weight']}
           onUpdateIngredientWeight={self.onUpdateIngredientWeight}
         />
      );
    }
    return selectedIngredientsWeights;
  }

  async onUpdateIngredientWeight(label, newWeight) {
    var selected = this.state.selected;

    for (var i = 0; i < selected.length; i++) {
      if (selected[i]['value'] === label) {

        if (!isNaN(newWeight)) {
          selected[i]['weight'] = Number(newWeight);
        }
      }
    }
    await this.setState({selected : selected});
  }

  render() {
    var selectedIngredients = this.renderSelectedIngredientsWeight();

    return (
      <div key="id1" className="module small">
      <pre>{JSON.stringify(this.state.selected)}</pre>
      <br />
      <b>{this.props.name} Selection</b>
      <br />

      <MultiSelect
        options={this.state.options}
        value={this.state.selected}
        onChange={this.setSelected}
        labelledBy="Select"
      />
        <br />
        <br />
         <br />
         {selectedIngredients}
      </div>
    );
  }
}

export default withFirebase(IngredientSelection);
