import React from 'react';
import MultiSelect from "react-multi-select-component";
import LookupSelection from '../../Utils/LookupSelection.js'
import { FirebaseContext } from '../../Firebase';
/**
 *  UnitsPerItemDetailsByMoldSize
 *
 */
class SingleUnitsPerItemDetail extends React.Component {
  constructor(props) {
    super(props);
    this.onChange = this.onChange.bind(this);
    this.state = {
      propLabel : this.props.state.label,
      propValue : this.props.amount
    }
  }

  async onChange(event) {
    if (this.props && this.props.onUpdate) {
      this.props.onUpdate(event.target.name,event.target.value);
    }
    let propValue = event.target.value;
    await this.setState({propValue});
  }

  render() {
    return (
      <div>
          {this.props.state.label} <input name={this.props.state.label} onChange={this.onChange} type="text" value={this.state.propValue}></input>
      </div>
    )
  }
}

class UnitsPerItemDetailsByMoldSize extends React.Component {

    constructor(props) {
      super(props);
      this.generateForInputsBasedOnSelection = this.generateForInputsBasedOnSelection.bind(this);
      this.onUpdateSelection = this.onUpdateSelection.bind(this);

      console.log('props for units per det item' , this.props);
      this.state = {
        selection : []
      };
    }

    onUpdateSelection(selection) {
      this.setState({selection});
    }

    onUpdateUnitsPerItemForMoldSize(key, value) {
      console.log('updating' , key, value);
    }

    generateForInputsBasedOnSelection() {

      if (this.state.selection && this.state.selection.length > 0) {
        let self = this;
        let selectionInputs = Object.keys(this.state.selection).map((key) => (
            <SingleUnitsPerItemDetail amount={0} onUpdate={this.onUpdateUnitsPerItemForMoldSize} state={this.state.selection[key]} key={key} />
        ));
        return selectionInputs;
      }
      return '';
    }

    render() {
      let inputSelectionAndDetails = this.generateForInputsBasedOnSelection();
      return (
          <div>
            <h4>Units Per Item By Mold/Size</h4>
            <div>
            {inputSelectionAndDetails}
            </div>
            <FirebaseContext.Consumer>
              {firebase =>
                  <LookupSelection
                    firebase={firebase}
                    onUpdateSelection={this.onUpdateSelection}
                    collectionName="moldSizePublic"
                    displayTitle=""
                    allowMultiple={true}
                    sendDataOnUpdate={true}
                  />
                }
            </FirebaseContext.Consumer>
          </div>
      )
    }
}

export default UnitsPerItemDetailsByMoldSize;
