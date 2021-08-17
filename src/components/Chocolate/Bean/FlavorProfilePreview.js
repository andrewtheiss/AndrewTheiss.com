import React from 'react';
import StaticCanvas from '../../Utils/StaticCanvas.js'

class FlavorProfilePreview extends React.Component {
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

    // Draw and label web
    // Input values if they exist
  renderFlavorProfile(ctx, width, height) {

    // Draw Web
    ctx.save();
    ctx.clearRect(0, 0, width, height);
    ctx.shadowBlur = 1;
    ctx.lineWidth = 0.3;
    ctx.shadowColor = 'rgb(255, 255, 255)';
    let spiderPercentageOfSpace = 0.7;
    let distancePerLevel = (Math.min(width/2, height/2) * spiderPercentageOfSpace) / 5;
    let centerx = width / 2;
    let centery = height / 2;
    ctx.beginPath();
    let spiderSize = 9;
    for (let level = 1; level < 6; level++) {

      let ogX = Math.sin(((2 * Math.PI) / spiderSize)) * distancePerLevel * level;
      let ogY = Math.cos(((2 * Math.PI) / spiderSize)) * distancePerLevel * level;
      ctx.moveTo(ogX + centerx,ogY + centery);
      for (let i = 0; i <= spiderSize; i++) {
        let angle = ((2 * Math.PI) / spiderSize) * i;

        let x = Math.sin(angle) * distancePerLevel * level;
        let y = Math.cos(angle) * distancePerLevel * level;
        ctx.lineTo(x + centerx,y + centery);

        if (level === 5) {
          let x = Math.sin(angle) * distancePerLevel * (level+1);
          let y = Math.cos(angle) * distancePerLevel * (level+1);
          if (this.props.preview) {
            ctx.font = "12px Helvetica";
          } else {
            ctx.font = "20px Helvetica";
          }
          ctx.textAlign = "center";
          if (i < spiderSize) {
            if (this.props.bean && this.props.bean.flavorArrays) {
              ctx.fillText(this.props.bean.flavorArrays[i][0], x + centerx,y + centery);
            }
          }
        }
      }

      for (let i = 0; i <= spiderSize; i++) {
        let angle = ((2 * Math.PI) / spiderSize) * i;

        ctx.moveTo(centerx,centery);
        let x = Math.sin(angle) * distancePerLevel * level;
        let y = Math.cos(angle) * distancePerLevel * level;
        ctx.lineTo(x + centerx,y + centery);
      }
    }
    ctx.closePath();
    ctx.stroke();

    ctx.beginPath();
    if (this.props.preview) {
      ctx.lineWidth = 1.5;
      ctx.shadowBlur = 1;
    } else {
      ctx.lineWidth = 3;
      ctx.shadowBlur = 2;
    }
    ctx.shadowColor = 'rgb(0, 0, 0)';
    // Draw spider graph
    if (this.props.bean && this.props.bean.flavorArrays) {
        let x1 = Math.sin(0) * distancePerLevel * this.props.bean.flavorArrays[0][1];
        let y1 = Math.cos(0) * distancePerLevel * this.props.bean.flavorArrays[0][1];
        ctx.moveTo(x1 + centerx,y1 + centery);

      for (let i = 0; i < this.props.bean.flavorArrays.length; i++) {
        let angle = ((2 * Math.PI) / spiderSize) * i;

        let x = Math.sin(angle) * distancePerLevel * this.props.bean.flavorArrays[i][1];
        let y = Math.cos(angle) * distancePerLevel * this.props.bean.flavorArrays[i][1];
        ctx.lineTo(x + centerx,y + centery);

      }
        ctx.lineTo(x1 + centerx,y1 + centery);
    }

    ctx.closePath();
    ctx.stroke();

    // Label Web

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
      [<StaticCanvas key="0"
        staticRenderFunction={this.renderFlavorProfile}
        dimensions={this.props.dimensions}
        />,
        <div key="1">{this.props.name}</div>]
    );
  }
}

export default FlavorProfilePreview;
