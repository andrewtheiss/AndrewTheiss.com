import React from 'react';

class BatchIncludedForm extends React.Component {

  constructor(props) {
    super(props);
    this.onChange = this.onChange.bind(this);

    this.state = {
      label : this.props.label,
      value : this.props.value
    };
  }

  async onChange(event) {
    let value = event.target.value;
    await this.setState({value});
    if (this.props.onUpdateBatchPct) {
      this.props.onUpdateBatchPct(this.state.label, event.target.value);
    }
  }

  render() {
    return(
      <div>
        <b>{this.state.label}: %</b><input type="text" size="2" value={this.state.value} onChange={this.onChange} ></input>
      </div>
    );
  }
}

export default BatchIncludedForm;
