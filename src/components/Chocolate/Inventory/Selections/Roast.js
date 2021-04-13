import React from 'react';
import * as CONSTS from '../constants.js'

// Create default bean params
// weight, beanID,



class RoastSelection extends React.Component {
  constructor(props) {
    super(props);
    this.removeTime = this.removeTime.bind(this);
    this.addTime = this.addTime.bind(this);
    this.changeValue = this.changeValue.bind(this);
    this.onUpdateRoast = this.onUpdateRoast.bind(this);
    this.addTime = this.addTime.bind(this);
    this.removeTime = this.removeTime.bind(this);

    console.log('contructed roast');
    var input;
    if (!this.props || !this.props.input || this.props.input.length === 0) {
      input = [0,0];
    } else {
      input = this.props.input;
    }
    this.state = {
      time : input[0],
      temp : input[1]
    }
  }

  removeTime() {
    this.props.onRemoveRoast(this.props.index);
  }
  addTime() {
    this.props.onAddRoast(this.props.index);
  }
  async changeValue(event) {
    await this.setState({[event.target.name] : event.target.value});
    this.onUpdateRoast();
  }
  onUpdateRoast() {
    let latestRoast = [this.state.time, this.state.temp];
    this.props.onChangeRoast(this.props.index, latestRoast);
  }
  render() {

    // Figure out how many roast entries there average
    // Build single roast entry
    return (
      <div>
        Roast
        <br />
          <label htmlFor="time0">Time:</label>
          <input
           name="time"
           value={this.state.time}
           onChange={this.changeValue}
           type="text"
           placeholder=""
         />&nbsp;&nbsp;&nbsp;
         <label htmlFor="temp0">Temp:</label>
         <input
          name="temp"
          value={this.state.temp}
          onChange={this.changeValue}
          type="text"
          placeholder=""
        />&nbsp;&nbsp;&nbsp;
        <button onClick={this.removeTime}>-</button>&nbsp;
        <button onClick={this.addTime}>+</button>
         </div>
    );
  }
}

export default RoastSelection;
