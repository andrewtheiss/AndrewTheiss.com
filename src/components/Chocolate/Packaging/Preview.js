import React from 'react';

/**
 *  Preview Mold Sizes
 */
class PreviewMoldSize extends React.Component {
  constructor(props) {
    super(props);
    this.selectMoldSize = this.selectMoldSize.bind(this);
    console.log(this.props);
    this.state = {
      mold : this.props.mold
    };
  }

  selectMoldSize() {
    if (this.props.onSelectMold) {
      this.props.onSelectMold(this.state.mold);
    }
  }

  render() {
    if (!this.props.mold) {
      return (<div></div>);
    }

    return (
      <div>Preview Mold here: {JSON.stringify(this.props.mold)}
        <img src={this.props.mold.imageBase64} ></img>
        <button onClick={this.selectMoldSize} >Select</button>
      </div>
    );
  }
}

export default PreviewMoldSize;
