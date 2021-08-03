import React from 'react';

/**
 *  Preview Mold Sizes
 */
class PreviewMoldSize extends React.Component {
  constructor(props) {
    super(props);
    this.selectMoldSize = this.selectMoldSize.bind(this);

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
    return (
      <div>Preview Mold here: {JSON.stringify(this.props.mold)}
        <button onClick={selectMoldSize} >Select</button>
      </div>
    );
  }
}

export default PreviewMoldSize;
