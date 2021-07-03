import React from 'react';
import Bar from './Bar.js'
import Ingredients from '../Ingredients/Ingredients.js'
import './Lookup.css';

/**
 *  Bar Lookup is a <select> multiple which grabs all bars from the database
 *   and allows you to select them
 *
 *  ** For now, we are just doing a single bar 6/30/21
 *
 */
class BarLookup extends React.Component {
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
      bars : {},
      selectedBeanId : undefined,
      previewBeanId : undefined
    };
    this.selectedBean = {};
    this.previewBean = {};
  }

  // Get all bars from the database
  // TODO - Filter bars by creation date to only grab newer bars
  componentDidMount = () => {
    const barsCollectionRef = this.props.firebase.db.collection("bars");
    let self = this;
    barsCollectionRef.get().then(function(barCollectionDocs) {
      var beansMap = {};
      barCollectionDocs.forEach(function(doc) {
        beansMap[doc.id] = doc.data();
      });

      self.setState({
        bars : barsMap
      });
    });

  }

  handleMouseOver(e) {
    var dataID = e.target.getAttribute('data-id');
    let beanData = this.state.bars[dataID];

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
      [<BarLookupSelection bean={this.selectedBean} dimensions={this.dimensions} key="0" />,
      <div key="1" >
      {Object.keys(this.state.bars).map((key) => (
        <div data-id={key} onMouseOver={this.handleMouseOver} onClick={this.handleClick}>
          <b>{key} - </b>{this.state.beans[key].name}
        </div>
      ))}
      </div>
      ]
    );
  }
}

export default BarLookup;
