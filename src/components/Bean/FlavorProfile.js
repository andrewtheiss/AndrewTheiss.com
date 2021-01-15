import React from 'react';
import Canvas from '../Utils/Canvas.js'

import  { FirebaseContext } from '../Firebase';

class FlavorProfile extends React.Component {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  canvas: HTMLCanvasElement | null;
  ctx: CanvasRenderingContext2D | null;
  canvasBounding: DOMRect | null;
  constructor(props) {
    super(props);
    this.canvasRef = React.createRef();
    this.canvas = null;
    this.ctx = null;
    this.canvasBounding = null;

    this.updateAnimationState = this.updateAnimationState.bind(this);
    this.state = {
      flavorProfile : {},
      selectedBeanId : undefined,
      name: "",
      angle: 0
    };

  }

  updateAnimationState() {
    this.setState(prevState => ({ angle: prevState.angle + 1 }));
    this.rAF = requestAnimationFrame(this.updateAnimationState);
  }

  componentWillUnmount() {
    cancelAnimationFrame(this.rAF);
  }

  getContext() {
    this.canvas = this.canvasRef.current;
    if (this.canvas) {
      this.ctx = this.canvas.getContext("2d");
    }
  }
  getCanvasBounding() {
    if (this.canvas) {
      this.canvasBounding = this.canvas.getBoundingClientRect();
    }
  }
  componentDidMount() {
    this.getContext();
    this.getCanvasBounding();
    this.rAF = requestAnimationFrame(this.updateAnimationState);
  }
  componentDidUpdate() {
    this.getCanvasBounding();
  }
  render() {
    return (
      <Canvas angle={this.state.angle} />
    );
  }
}

export default FlavorProfile;
