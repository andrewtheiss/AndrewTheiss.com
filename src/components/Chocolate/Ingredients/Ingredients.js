import React from 'react';

class Ingredients extends React.Component {
  constructor(props) {
    super(props);
    this.dimensions = {
      width: 500,
      height: 500
    };
    // When state changes, render is called
    this.state = {
      beans : {},
      selectedBeanId : undefined,
      previewBeanId : undefined
    };
    this.selectedBean = {};
    this.previewBean = {};
  }

  render() {
    return "<div>Ingredient X</div>";
  }
}
 export default Ingredients;
