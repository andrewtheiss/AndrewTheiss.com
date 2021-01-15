import React from 'react';
import StaticCanvas from '../Utils/StaticCanvas.js'

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
    this.renderFlavorProfile = this.renderFlavorProfile.bind(this)
    this.state = {
      flavorProfile : {},
      selectedBeanId : undefined,
      name: "",
      angle: 0
    };

  }

  renderFlavorProfile(ctx, width, height) {

    // Draw and label web
    // Input values if they exist
    ctx.save();
    ctx.clearRect(0, 0, width, height);
    ctx.lineWidth = 1;
    let spiderPercentageOfSpace = 0.8;
    let distancePerLevel = (Math.min(width/2, height/2) * spiderPercentageOfSpace) / 5;

    console.log('distancePerLevel  ' + distancePerLevel);
    let centerx = width / 2;
    let centery = height / 2;
    ctx.beginPath();
    let spiderSize = 9;
    for (let level = 1; level < 5; level++) {

      let ogX = Math.sin(((2 * Math.PI) / spiderSize)) * distancePerLevel * level;
      let ogY = Math.cos(((2 * Math.PI) / spiderSize)) * distancePerLevel * level;
      ctx.moveTo(ogX + centerx,ogY + centery);
      for (let i = 0; i <= spiderSize; i++) {
        let angle = ((2 * Math.PI) / spiderSize) * i;

        let x = Math.sin(angle) * distancePerLevel * level;
        let y = Math.cos(angle) * distancePerLevel * level;
        ctx.lineTo(x + centerx,y + centery);
      }
    }
    ctx.closePath();
    ctx.stroke();

    ctx.restore();
    return ctx;
  }

  // On state change IF state changes, re-render here
  updateAnimationState() {
    this.setState(prevState => ({ angle: prevState.angle + 1 }));
    //this.rAF = requestAnimationFrame(this.updateAnimationState);
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
      <StaticCanvas
        staticRenderFunction={this.renderFlavorProfile}
        dimensions={this.props.dimensions}
        />
    );
  }
}

export default FlavorProfile;
