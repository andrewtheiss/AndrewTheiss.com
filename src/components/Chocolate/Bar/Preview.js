import React from 'react';
import ReactDOM from "react-dom";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  useParams
} from "react-router-dom";
import { FirebaseContext } from '../../Firebase';


class BarPreview extends React.Component {
  constructor(props) {
    super(props);
  }


  // Get data from DB in this function
  async componentDidMount() {
    console.log(this.props);
    const collectionRef = this.props.firebase.db.collection("barsPublic");
    /*
      let self = this;
      await collectionRef.get().then(function(collectionDocs) {
        var moldData = {};
        collectionDocs.forEach(function(doc) {
          moldData[doc.id] = doc.data();
        });

        self.moldData = moldData;
      });
      */
  }

  render() {
    return(<div>PREVIEW BAR : </div>)
  }

}

export default BarPreview;
