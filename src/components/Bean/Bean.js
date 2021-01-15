import React from 'react';
import FlavorProfile from './FlavorProfile.js'
import './Bean.css';

import  { FirebaseContext } from '../Firebase';

class Bean extends React.Component {
  constructor(props) {
    super(props);
    this.componentDidMount = this.componentDidMount.bind(this)
    this.dimensions = {
      width: 500,
      height: 500
    };
    // When state changes, render is called
    this.state = {
      beans : {},
      selectedBeanId : undefined
    };
    this.selectedBean = {};
  }

  // Get data from DB in this function
  componentDidMount = () => {
    const beanCollectionRef = this.props.firebase.db.collection("beans");
    let self = this;
    beanCollectionRef.get().then(function(beanCollectionDocs) {
      var beansMap = {};
      beanCollectionDocs.forEach(function(doc) {
        beansMap[doc.id] = doc.data();
        // doc.data() is never undefined for query doc snapshots
      //  beansArray.push(doc.data());

      });
      console.log(beansMap);
      self.setState({
        beans : beansMap
      });
    });

  }

  renderBean() {

  }

  render() {
    return (
      [<div key="0" >
      {Object.keys(this.state.beans).map((key) => (
        <div><b>{key} - </b>{this.state.beans[key].name}</div>
      ))}
      </div>,
      <FlavorProfile bean={this.selectedBean} dimensions={this.dimensions} key="1" />]
    );
  }
}

export default Bean;
