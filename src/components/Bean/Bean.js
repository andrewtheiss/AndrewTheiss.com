import React from 'react';
import './Bean.css';

import  { FirebaseContext } from '../Firebase';

class Bean extends React.Component {
  constructor(props) {
    super(props);

    // When state changes, render is called
    this.state = {
      beans : [],
      selectedBeanId : undefined
    };
  }

  // Get data from DB in this function
  componentDidMount() {
    const beanCollectionRef = this.props.firebase.db.collection("beans");

    beanCollectionRef.get().then(function(querySnapshot) {
      querySnapshot.forEach(function(doc) {
        // doc.data() is never undefined for query doc snapshots
        console.log(doc.id, " => ", doc.data());
      });
    });

    this.setState({
      beans : ["Loading"]
    });

  }
  renderBeanList() {

  }

  renderBean() {
    
  }

  render() {
    return (
      <div>
      <h1>{this.state.beans}</h1>
      <datalist id="beans">
        <option value="Bean1" />
        <option value="Bean2" />
        <option value="Bean3" />
      </datalist>
      </div>
    );
  }
}

export default Bean;
