import React from 'react';
import Ingredients from '../Ingredients/Ingredients.js'
import ChocolatePreview from './Preview.js'
import './Chocolate.css';


class Chocolate extends React.Component {
  constructor(props) {
    super(props);
    this.componentDidMount = this.componentDidMount.bind(this);
    this.dimensions = {
      width: 500,
      height: 500
    };
    // When state changes, render is called
    this.state = {
      chocolates : {}
    };
  }

  // Get data from DB in this function
  componentDidMount = () => {
    const chocolatesCollectionRef = this.props.firebase.db.collection("chocolates");
    let self = this;
    chocolatesCollectionRef.get().then(function(chocolateCollectionDocs) {
      var chocolatesMap = {};
      chocolateCollectionDocs.forEach(function(doc) {
        chocolatesMap[doc.id] = doc.data();
      });

      self.setState({
        chocolates : chocolatesMap
      });
    });

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
    const chocolateArray = [];
    Object.keys(this.state.chocolates).forEach(element =>
      chocolateArray.push(<b>asdf</b>)
    );
    const chocolates = Object.keys(this.state.chocolates).map((key) => (
        <div key={key} data-id={key} >
          <b>{key} - </b>{this.state.chocolates[key].name}
        </div>
      ));
    return (
      <div className="beanMasterList" key="b0" >
      </div>
    );
  }
}

// https://blog.bitsrc.io/12-react-ui-layout-grid-components-and-libraries-for-2019-16e8aa5d0b08
// 6. Autoresponsive React

export default Chocolate;
