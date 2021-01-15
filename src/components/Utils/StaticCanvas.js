import React from 'react';
import PureCanvas from './PureCanvas.js';

class StaticCanvas extends React.Component {
  constructor(props) {
    super(props);
    console.log(props);
    this.saveContext = this.saveContext.bind(this);
  }

  saveContext(ctx) {
    this.ctx = ctx;
    this.width = this.ctx.canvas.width;
    this.height = this.ctx.canvas.height;
  }

  componentDidUpdate() {
    this.ctx =   this.props.staticRenderFunction(this.ctx, this.width, this.height);
  }

  render() {
    return <PureCanvas dimensions={this.props.dimensions} contextRef={this.saveContext} />;
  }
}

export default StaticCanvas;
// borrowing from https://codepen.io/philnash/pen/pxzVzw
// and https://philna.sh/blog/2018/09/27/techniques-for-animating-on-the-canvas-in-react/
