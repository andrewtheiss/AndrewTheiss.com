import React from 'react';
import { FirebaseContext } from '../../../Firebase';
import World from "@svg-maps/world";
import { SVGMap } from "react-svg-map";
import "react-svg-map/lib/index.css";

class TastingGeographic extends React.Component {
  constructor(props) {
    super(props);
    
    this.state = {
      tasting : {},
      ingredientsList : {},
      showAnswers : false
    }
  }

  async componentDidUpdate(prevProps) {
    if (this.props !== prevProps) {
      let tasting = {};
      if (JSON.stringify(this.props.tastingId) !== JSON.stringify(prevProps.tastingId)) {

        let self = this;
        const docRef = this.props.firebase.db.collection("tastingPublic").doc(this.props.tastingId);
        await docRef.get().then(function(doc) {
          if (doc.exists) {
            tasting = doc.data();
          }
          self.setState({tasting});
        });
      } else if (JSON.stringify(this.props.tasting) !== JSON.stringify(prevProps.tasting)) {
        tasting = this.props.tasting;
        this.setState({tasting});
      }
    }
  }

  async componentDidMount() {
    let self = this;

    // Get ingredients list
    const collectioRef = this.props.firebase.db.collection("ingredients");
    await collectioRef.get().then(function(collectionDocs) {
      var ingredientsList = {};
      collectionDocs.forEach(function(doc) {
        ingredientsList[doc.id] = doc.data();
      });

      self.setState({ingredientsList});
    });

    // If we give this a tastingId
    let tasting = {};
    if  (!this.props.tasting || Object.keys(this.props.tasting).length === 0) {
      const docRef = this.props.firebase.db.collection("tastingPublic").doc(this.props.tastingId);
      await docRef.get().then(function(doc) {
        if (doc.exists) {
          tasting = doc.data();
        }
        self.setState({tasting});
      });
    } else {
        tasting = this.props.tasting;
        self.setState({tasting});
    }
  }

  render() {
    return (
      <div>
        Whaddup
        <SVGMap map={World} />;
      </div>
    );
  }
}


export default TastingGeographic;
