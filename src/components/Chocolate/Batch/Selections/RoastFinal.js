import React from 'react';
import * as CONSTS from '../constants.js'

class RoastFinal extends React.Component {
  constructor(props) {
    super(props);
    this.calculateAverage = this.calculateAverage.bind(this);
    this.changeValue = this.changeValue.bind(this);
    var input;
    if (!this.props || !this.props.input || this.props.input.length === 0) {
      input = {
        high : 0,
        low : 0
      };
    } else {
      input = this.props.input;
    }
    this.state = {
      high : input.high,
      low : input.low,
      average : 0
    }
    this.calculateAverage();
  }

  async calculateAverage() {
    var high = Number(this.state.high);
    var low = Number(this.state.low);
    var average = 0;
    if (high === 0 && low === 0) {
       average = 0;
    } else if (low === 0) {
        average = high;
    } else if (high === 0) {
        average = low;
    } else {
      average = high / low;
    }
    await this.setState({ average : average});
  }
  async changeValue(event) {
    await this.setState({[event.target.name] : event.target.value});
    this.calculateAverage();
    this.props.onChangeRoastFinalTemps(this.state);
  }
  render() {
    return (
      <div>
        <label htmlFor="high">High: </label>
        <input
           size="5"
           name="high"
           value={this.state.high}
           onChange={this.changeValue}
           type="text"
           placeholder=""
         />
        <br />
        <label htmlFor="low">Low: </label>
        <input
          size="5"
          name="low"
          value={this.state.low}
          onChange={this.changeValue}
          type="text"
          placeholder=""
        />
        <br />
      </div>
    );
  }
}

export default RoastFinal;
