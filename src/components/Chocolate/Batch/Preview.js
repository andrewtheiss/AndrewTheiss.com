import React from 'react';

class ChocolatePreview extends React.Component {

  render() {
    console.log(this.props);
    return(<div>{this.props}</div>);
  }
}

export default ChocolatePreview;
