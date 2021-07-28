import React from 'react';

class RoastSelection extends React.Component {
  constructor(props) {
    super(props);
    this.removeTime = this.removeTime.bind(this);
    this.addTime = this.addTime.bind(this);
    this.changeValue = this.changeValue.bind(this);
    this.onUpdateRoast = this.onUpdateRoast.bind(this);

    var input;
    if (!this.props || !this.props.input || Object.keys(this.props.input).length === 0) {
      input = {elapsedTimeInMinutes : 0, tempInF : 0};
    } else {
      input = this.props.input;
    }
    this.state = {
      elapsedTimeInMinutes : input.elapsedTimeInMinutes,
      tempInF : input.tempInF
    };
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
    let latestRoast = {
      elapsedTimeInMinutes : this.state.elapsedTimeInMinutes,
      tempInF : this.state.tempInF
    };
    this.props.onChangeRoast(this.props.index, latestRoast);
  }

  render() {
    let uniqueKey = this.props.index + "roastSelection";
    // Figure out how many roast entries there average
    // Build single roast entry
    return (
      <div key={uniqueKey}>
          <label htmlFor="time0">Elapsed Time: </label>
          <input
            size="5"
           name="elapsedTimeInMinutes"
           value={this.state.elapsedTimeInMinutes}
           onChange={this.changeValue}
           type="text"
           placeholder=""
         />&nbsp;&nbsp;&nbsp;
         <label htmlFor="temp0">Temp: </label>
         <input
          size="5"
          name="tempInF"
          value={this.state.tempInF}
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
