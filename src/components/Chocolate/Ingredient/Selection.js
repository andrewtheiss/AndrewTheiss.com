import React from 'react';
import { withFirebase } from '../../Firebase';
import IngredientSelectionWeight from './SelectionWeight.js'
import MultiSelect from "react-multi-select-component";
import '../Theme/main.css';
import './Ingredient.css'


class IngredientSelection extends React.Component {
  constructor(props) {
    super(props);

    // Find the prop of the ingredient selection
    console.log(props.name);
    this.state = {
      IngredientMap : '',
      options : [],
      selected : []
    };

    this.setSelected = this.setSelected.bind(this);
    this.componentDidMount = this.componentDidMount.bind(this);
    this.renderSelectedIngredientWeight = this.renderSelectedIngredientWeight.bind(this);
    this.onUpdateIngredientWeight = this.onUpdateIngredientWeight.bind(this);
  }

  componentDidMount() {
    const IngredientCollectionRef = this.props.firebase.db.collection("ingredients");
    let self = this;
    IngredientCollectionRef.where("category", "==", this.props.name).get().then(function(IngredientCollectionDocs) {
      var IngredientMap = {};
      var options = [];
      IngredientCollectionDocs.forEach(function(doc) {
      var ingWeight = (doc.data()['weight'] === undefined) ? 0 : doc.data()['weight'];
        IngredientMap[doc.id] = doc.data();
        options.push({
          label:doc.data()['name'],
          value : doc.id,
          weight : ingWeight
          });
      });

      self.setState({
        IngredientMap : IngredientMap,
        options : options
      });
    });
  }

  // Set Selected Ingredient so we can update the value of their weight in grams
  async setSelected(allSelectedItems) {
    await this.setState({ selected : allSelectedItems});
    this.props.onChangeSelection(this.props.name, this.state.selected);
  }

  /**
   *  renderSelectedIngredientWeight
   *
   *  Check all selected Ingredient of type and allow for value input
   */
  renderSelectedIngredientWeight() {
    let selectedIngredientWeights = '';
    let selected = this.state.selected;
    var self = this;
    let hasItems = !(!selected || selected.length === 0 || selected.length === '0');
    if (hasItems) {

    // Creating a unique key forces re-render ONLY each time length is changed
      var rand = selected.length/3.14159;

      selectedIngredientWeights = selected.map((ingredient, index) =>
        <IngredientSelectionWeight
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
    return selectedIngredientWeights;
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
    this.props.onChangeSelection(this.props.name, this.state.selected);
  }

  render() {
    var selectedIngredient = this.renderSelectedIngredientWeight();

    return (
      <div key="id1" className="module w700">
      <div className="floatRight">
        <b>{this.props.name} Selection</b>
        <MultiSelect
          options={this.state.options}
          value={this.state.selected}
          onChange={this.setSelected}
          labelledBy="Select"
        />
      </div>
      <div className="floatLeft">
        {selectedIngredient}
       </div>
       <div className="clearBoth"></div>
      </div>
    );
  }
}

export default withFirebase(IngredientSelection);
