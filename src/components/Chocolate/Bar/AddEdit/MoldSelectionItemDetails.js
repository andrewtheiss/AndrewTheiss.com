import React from 'react';

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

    this.state = this.props;
  }

  async onUpdateDetails(event) {
    await this.setState({[event.target.name] : event.target.value});
  }

  recalculatePricePerBarAndNutritionFacts() {

  }

  render() {
    return (
      <div>
      <div>Individual Mold Selection:</div>
      Bar Count:  <input name="barCount"  onChange={this.onUpdateDetails} value={this.state.barCount} size="5" placeholder="" type="text"></input><br />
      Bar Count:  <input name="barWeight"  onChange={this.onUpdateDetails} value={this.state.barWeight} size="5" placeholder="" type="text"></input><br />
      Packaging Selection:

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
