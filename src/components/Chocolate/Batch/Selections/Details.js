import React from 'react';

class IngredientDetails extends React.Component {
  constructor(props) {
    super(props);
    this.onUpdateDetails = this.onUpdateDetails.bind(this);
    this.state = {
      label : '000-2021-00A',
      cost : -1,
      creation : '2021-02-07',
      grindInHours : 48,
      kgYield : 0,
      notes : '',
      objective : '',
      packaging : '',
      summary : ''
    };
    this.props.onChangeDetails(this.state);
  }

  async onUpdateDetails(event) {
    var state = this.state;
    state[event.target.name] = event.target.value;
    console.log({[event.target.name] : event.target.value});
    await this.setState(state);
    this.props.onChangeDetails(this.state);
  }

  render() {
    return (
      <div>
      <br />
      Ingredient Details
      <br />
        Label: <input name="label" value={this.state.label} onChange={this.onUpdateDetails}  type="text"></input>
        <br />
        Creation: <input name="creation" onChange={this.onUpdateDetails} value={this.state.creation} type="date"></input><br />
        Grind In Hours: <input name="grindInHours"  onChange={this.onUpdateDetails} value={this.state.grindInHours} type="text"></input><br />
        Yield (kg): <input name="kgYield" onChange={this.onUpdateDetails} value={this.state.kgYield} type="text"></input><br />
        Notes: <input name="notes"  onChange={this.onUpdateDetails}  value={this.state.notes} type="textarea"></input><br />
        Objective: <input name="objective"  onChange={this.onUpdateDetails} value={this.state.objective} type="textarea"></input><br />
        Packing: <input name="packaging" onChange={this.onUpdateDetails} value={this.state.packaging} type="textarea"></input><br />
        Summary: <input name="summary" onChange={this.onUpdateDetails} value={this.state.summary} type="textarea"></input><br />
       </div>
    );
  }
}

export default IngredientDetails;
