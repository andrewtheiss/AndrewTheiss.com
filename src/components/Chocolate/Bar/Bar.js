import React from 'react';
import AddNewIngredientPage from '../Ingredient/Pages/AddNew.js'
import './Bar.css';


class Bar extends React.Component {
  constructor(props) {
    super(props);
    this.componentDidMount = this.componentDidMount.bind(this);
    this.handleMouseOver = this.handleMouseOver.bind(this);
    this.handleClick = this.handleClick.bind(this);
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

  // Get data from DB in this function
  componentDidMount = () => {
    const beanCollectionRef = this.props.firebase.db.collection("beans");
    let self = this;
    beanCollectionRef.get().then(function(beanCollectionDocs) {
      var beansMap = {};
      beanCollectionDocs.forEach(function(doc) {
        beansMap[doc.id] = doc.data();
      });

      self.setState({
        beans : beansMap
      });
    });
  }

  handleMouseOver(e) {
    var dataID = e.target.getAttribute('data-id');
    let beanData = this.state.beans[dataID];

    // Only if there is a selected bean
    if (beanData) {
      this.previewBean = this.state.beans[dataID];
      this.previewBean['id'] = dataID;
      this.setState({
        previewBeanId : dataID
      });
    }
  }

  handleClick(e) {
    var dataID = e.target.getAttribute('data-id');
    let beanData = this.state.beans[dataID];

    // Only if there is a selected bean
    if (beanData) {
      this.selectedBean = this.state.beans[dataID];
      this.selectedBean['id'] = dataID;
      this.selectedBean['flavorArrays'] = this.getFlavorProfileAsArrays(this.selectedBean['flavorProfile']);
      this.setState({
        selectedBeanId : dataID
      });
    }
  }

  getFlavorProfileAsArrays(dataMap) {
    let flavorArrays = [];
    for (const value in dataMap) {
      flavorArrays.push([value[0].toUpperCase() + value.substring(1), dataMap[value]]);
    }
    flavorArrays.sort(function(a,b) {
      return a[0].localeCompare(b[0]);
    });
    return flavorArrays;
  }

  render() {
    return (
      [<div key="0" >
      {Object.keys(this.state.beans).map((key) => (
        <div data-id={key} onMouseOver={this.handleMouseOver} onClick={this.handleClick}>
          <b>{key} - </b>{this.state.beans[key].name}
        </div>
      ))}
      </div>,
      <AddNewIngredientPage bean={this.selectedBean} dimensions={this.dimensions} key="1" />]
    );
  }
}

export default Bar;
