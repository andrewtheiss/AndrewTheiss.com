import React from 'react';

// shouldComponentUpdate is false to prevent re-render of <canvas> html
class PureCanvas extends React.Component {
  shouldComponentUpdate() {
    return false;
  }

  render() {
    return (
      <canvas
        width={this.props.dimensions.width}
        height={this.props.dimensions.height}
        ref={node =>
          node ? this.props.contextRef(node.getContext('2d')) : null
        }
      />
    );
  }
}

export default PureCanvas;
