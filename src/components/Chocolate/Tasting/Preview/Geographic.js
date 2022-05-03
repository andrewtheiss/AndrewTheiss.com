import React from 'react';
import { FirebaseContext } from '../../../Firebase';
import World from "@svg-maps/world";
import { CheckboxSVGMap } from "react-svg-map";
import "react-svg-map/lib/index.css";
import {getLocationName} from "./utils.js"

// https://www.npmjs.com/package/react-svg-map#maps
// borrowed things from https://github.com/VictorCazanave/react-svg-map/blob/master/examples/src/components/checkbox-map.jsx

class TastingGeographic extends React.Component {
  constructor(props) {
    super(props);
    
    this.state = {
      tasting : {},
      ingredientsList : {},
      showAnswers : false,
			pointedLocation: null,
			focusedLocation: null,
			selectedLocations: []
    }

		this.handleLocationMouseOver = this.handleLocationMouseOver.bind(this);
		this.handleLocationMouseOut = this.handleLocationMouseOut.bind(this);
		this.handleLocationFocus = this.handleLocationFocus.bind(this);
		this.handleLocationBlur = this.handleLocationBlur.bind(this);
		this.handleOnChange = this.handleOnChange.bind(this);
	}

	handleLocationMouseOver(event) {
		const pointedLocation = getLocationName(event);
		this.setState({ pointedLocation: pointedLocation });
	}

	handleLocationMouseOut() {
		this.setState({ pointedLocation: null });
	}

	handleLocationFocus(event) {
		const focusedLocation = getLocationName(event);
		this.setState({ focusedLocation: focusedLocation });
	}

	handleLocationBlur() {
		this.setState({ focusedLocation: null });
	}

	handleOnChange(selectedNodes) {
		this.setState(prevState => {
			return {
				selectedLocations: selectedNodes.map(node => node.attributes.name.value)
			};
		});
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
        
					<div className="examples__block__info__item">
						Pointed location: {this.state.pointedLocation}
					</div>
					<div className="examples__block__info__item">
						Focused location: {this.state.focusedLocation}
					</div>
        <CheckboxSVGMap 
          map={World}
          onLocationMouseOver={this.handleLocationMouseOver}
          onLocationMouseOut={this.handleLocationMouseOut}
          onLocationFocus={this.handleLocationFocus}
          onLocationBlur={this.handleLocationBlur}
          onChange={this.handleOnChange} 
            />;
      </div>
    );
  }
}


export default TastingGeographic;
