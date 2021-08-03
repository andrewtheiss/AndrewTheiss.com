import React from 'react';
import MultiSelect from "react-multi-select-component";

/**
 *  AddEditMoldSize
 *
 */
class AddEditMoldSize extends React.Component {
  constructor(props) {
    super(props);
    this.generateSelectedPreview = this.generateSelectedPreview.bind(this);

    this.state = {};
  }

  generateSelectedPreview() {
      return '';
  }

  async onUpdateDetails(event) {
    var state = this.state;
    state[event.target.name] = event.target.value;
    await this.setState(state);
    this.props.onChangeDetails(this.state);
  }

  render() {
    let previewSelected = this.generateSelectedPreview();
    return (
      <div>
      Grind In Hours: <input name="grindInHours"  onChange={this.onUpdateDetails} value={this.state.grindInHours} type="text"></input><br />
      <button>Set Mold and Size</button>
      </div>
    );
  }
}

export default AddEditMoldSize;
