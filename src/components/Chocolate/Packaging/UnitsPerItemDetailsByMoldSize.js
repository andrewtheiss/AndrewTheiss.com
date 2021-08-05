import React from 'react';
import LookupSelection from '../../Utils/LookupSelection.js'
import { FirebaseContext } from '../../Firebase';
import './Packaging.css'
/**
 *  UnitsPerItemDetailsByMoldSize
 *
 */
class SingleUnitsPerItemDetail extends React.Component {
  constructor(props) {
    super(props);
    console.log(props);
    this.onChange = this.onChange.bind(this);
    let value = (this.props.value) ? this.props.value : "";
    this.state = {
      propLabel : this.props.label,
      propValue : value
    };
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
      <div className="unitsPerItemFormListItem">
          {this.state.propLabel}<input className="unitsPerItemDetailedInput" size="5" name={this.state.propLabel} onChange={this.onChange} type="text" value={this.state.propValue}></input>
      </div>
    )
  }
}

class UnitsPerItemDetailsByMoldSize extends React.Component {

    constructor(props) {
      super(props);
      this.generateForInputsBasedOnSelection = this.generateForInputsBasedOnSelection.bind(this);
      this.onUpdateUnitsPerItemForMoldSize = this.onUpdateUnitsPerItemForMoldSize.bind(this);
      this.onUpdateSelection = this.onUpdateSelection.bind(this);
      this.generateSelectionFromProps = this.generateSelectionFromProps.bind(this);
      this.state = {
        selectionValues : this.props.state,
        selection : this.generateSelectionFromProps()
      };
    }

    generateSelectionFromProps() {
      let selection = [];
      for (var i in this.props.state) {
        selection.push({label  : i, value : i});
      }
      return selection;
    }

    onUpdateSelection(selection) {
      this.setState({selection});
    }

    onUpdateUnitsPerItemForMoldSize(key, value) {
      let selectionValues = this.state.selectionValues;
      selectionValues[key] = value;
      if (!value) {
        delete selectionValues[key];
      }
      this.setState({selectionValues});

      // Update parent
      if (this.props.onUpdate) {
        this.props.onUpdate(selectionValues);
      }
    }

    generateForInputsBasedOnSelection() {
      let selectionInputs = '';
      if (this.state.selection && this.state.selection.length > 0) {
        selectionInputs = Object.keys(this.state.selection).map((key) => (
            <SingleUnitsPerItemDetail value={this.state.selectionValues[key]} onUpdate={this.onUpdateUnitsPerItemForMoldSize} label={this.state.selection[0].label} key={key} />
        ));
      }
      return selectionInputs;
    }

    render() {
      let inputSelectionAndDetails = this.generateForInputsBasedOnSelection();
      return (
          <div>
            <h4 className="unitsPerItemHeader">Units Per Item By Mold/Size</h4>
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
