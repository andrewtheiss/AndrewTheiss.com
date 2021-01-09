import React from 'react';
import Firebase from '../config.js'
import './bean.css';

class Bean extends React.Component {
  getData() {
    const db = Firebase.database();
    const dbRef = db.collection("beans");
  }
  constructor(props) {
    super(props);

    // Initialize the state of beans
    // Every time state is called, render is as well
    this.state = { beans : [] };
    this.listRef = React.createRef();
    this.getData();

  }
  render() {
    return (
      <datalist id="beans">
        <option value="Bean1" />
        <option value="Bean2" />
        <option value="Bean3" />
      </datalist>
    );
  }
}

export default Bean;
