import React from 'react';
import "../Bar.css"
import { FirebaseContext } from '../../../Firebase';
import LookupSelection from '../../../Utils/LookupSelection.js'

/**


<MoldSelectionItemDetails
 label={key}
 value={self.state.barMoldDetails[key]}
 onUpdateBarMoldDetails={self.onUpdateBarMoldDetails}
 key={key}
/>

 */
class MoldSelectionItemDetails extends React.Component {

  constructor(props) {
    super(props);
    this.onUpdateDetails = this.onUpdateDetails.bind(this);

    this.state = {};
    this.setState(this.props);
    console.log(this.props);
  }

  async onUpdateDetails(event) {
    await this.setState({[event.target.name] : event.target.value});
  }

  recalculatePricePerBarAndNutritionFacts() {

  }

  generatePreviewForSelectedWrapItems() {
    
  }

  render() {
    console.log(this.props, this.state);
    const collectionRefSearchWrap = this.props.firebase.db.collection("packaging").where("category", "==", "Wrap");
    const collectionRefSearchOverwrap = this.props.firebase.db.collection("packaging").where("category", "==", "Overwrap");
    const collectionRefSearchLabel = this.props.firebase.db.collection("packaging").where("category", "==", "Label");
    return (
      <div>
      <div>
        <p className="moldSelectionLabel"><b>{this.props.label}</b></p>
        Bar Count:  <input name="barCount"  onChange={this.onUpdateDetails} value={this.state.barCount} size="5" placeholder="" type="text"></input><br />
      </div>
        <FirebaseContext.Consumer>
          {firebase =>
              <LookupSelection
                firebase={firebase}
                onUpdateSelection={this.onUpdateSelection}
                collectionName="packaging"
                displayTitle="Packaging Wrap"
                allowMultiple={true}
                sendDataOnUpdate={true}
                customSearch={collectionRefSearchWrap}
              />
            }
        </FirebaseContext.Consumer>
      <FirebaseContext.Consumer>
        {firebase =>
            <LookupSelection
              firebase={firebase}
              onUpdateSelection={this.onUpdateSelection}
              collectionName="packaging"
              displayTitle="Packaging Overwrap"
              allowMultiple={true}
              sendDataOnUpdate={true}
              customSearch={collectionRefSearchOverwrap}
            />
          }
      </FirebaseContext.Consumer>
      <FirebaseContext.Consumer>
        {firebase =>
            <LookupSelection
              firebase={firebase}
              onUpdateSelection={this.onUpdateSelection}
              collectionName="packaging"
              displayTitle="Packaging Label"
              allowMultiple={true}
              sendDataOnUpdate={true}
              customSearch={collectionRefSearchLabel}
            />
          }
      </FirebaseContext.Consumer>
      <div className="barMoldDetailSelectionPreview">
      </div>
    </div>
    );
  }
}

export default MoldSelectionItemDetails;


/*

  barCount : '',
  barWeight : '',
  wrappingPricePerBar : '',
  overwrappingPricePerBar : '',
  labelPricePerBar : '',
  packgingSelection : {

  },

  // This is pretty low priority as everything "should" have the same for now!
  samePackagingForAllBars : true,
  packagingSelectionForIndividualBars : {},

  nutritionFacts : {},
- Wrapping
- Overwraping
- Label
Calculate cost based on the % of different bars which make up the batch
Calculate nutrition facts
*/
