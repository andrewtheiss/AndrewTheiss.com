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



  render() {
    return (
      <div>
      <div>Individual Mold Selection: {JSON.stringify(this.props)}</div>
      <input type="text" name="barCount">Bars this size:</input>
      <input >Bars this size:</input>
      - Wrapping
- Overwraping
- Label
Calculate cost based on the % of different bars which make up the batch
Calculate nutrition facts
      </div>
    );
  }
}

export default MoldSelectionItemDetails;
