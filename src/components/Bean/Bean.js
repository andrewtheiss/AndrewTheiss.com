import React from 'react';
import './Bean.css';

import  { FirebaseContext } from '../Firebase';

class Bean extends React.Component {
  getData() {
    const db = this.props.firebase.db;
    db.collection("beans");
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
