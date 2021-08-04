import React from 'react';

/**
 *  Preview Mold Sizes
 *
 *  Props:
 *  model           : model of selected item to preview
 *  onSelect        : (optional) method if preview is to be selectable via click
 *
 *  Props To Program:
 *
 */
class PreviewItem extends React.Component {
  constructor(props) {
    super(props);
    this.select = this.select.bind(this);
    console.log(this.props);
    this.state = {
      model : this.props.model
    };
  }

  select() {
    if (this.props.onSelect) {
      this.props.onSelect(this.state.model);
    }
  }

  render() {
    if (!this.props.model) {
      return (<div></div>);
    }

    return (
      <div>Preview {this.props.model.label} here: {JSON.stringify(this.props.model)}
        <img src={this.props.model.imageBase64} alt=""></img>
        <button onClick={this.select} >Select</button>
      </div>
    );
  }
}

export default PreviewItem;
