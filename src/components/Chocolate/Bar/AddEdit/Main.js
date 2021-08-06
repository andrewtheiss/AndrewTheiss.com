import React from 'react';
import * as CONSTS from '../constants.js'
import { FirebaseContext } from '../../../Firebase';
import LookupSelection from '../../../Utils/LookupSelection.js'
import BatchesIncluded from './BatchesIncluded.js'
/**
 *  AddEditBar
 *
 */
class AddEditBar extends React.Component {
  constructor(props) {
    super(props);
    this.onUpdateBatchesSelection = this.onUpdateBatchesSelection.bind(this);
    this.setBar = this.setBar.bind(this);
    this.validateBar = this.validateBar.bind(this);
    this.onUpdateDetails = this.onUpdateDetails.bind(this);
    this.updateBarSelection = this.updateBarSelection.bind(this);

    this.state = CONSTS.DEFAULT_BAR;
    this.itemSelectedForEdit = false;
  }

  componentDidUpdate(prevProps) {
    let isEdit = this.props.itemSelectedForEdit;

    // Only do something if there's a change in the batchToEdit
    if (this.props !== prevProps) {

      // If there's something to edit or the props don't match the default
      if (isEdit) {

        // Save the selected label we selected for edit
        if (this.props.itemSelectedForEdit) {
          let itemSelected = this.formatSelectedCategory(this.props.itemSelectedForEdit);
          this.setState(itemSelected);
        }
      } else {
        this.setState(CONSTS.DEFAULT_BAR);
      }
    }
  }

  async onUpdateDetails(event) {
    var state = this.state;
    state[event.target.name] = event.target.value;
    await this.setState(state);
  }

  async formatBarForSet() {
    /*
    let latestAverageCostPerUnit = Math.round(Number(this.state.purchasedPrice / this.state.unitsPerItem)*100)/100 * Number((this.state.percentWaste / 100) + 1);
    await   this.setState({latestAverageCostPerUnit});


    return {
      category : this.state.category,
      label : this.state.label,
      imageBase64 : this.state.imageBase64,
      latestAverageCostPerUnit : this.state.latestAverageCostPerUnit
    };
    */
  }

  validateBar() {
    let valid = true;
    let alertStr = "";

    if (!this.state.label) {
      valid = false;
      alertStr += "You gotta have a bar label ... dude.";
    }

    if (!valid) {
      alert(alertStr);
    }
    return valid;
  }

  async setBar() {
    if (this.validateBar()) {

      //let publicBar = await this.formatBarForSet();
      let barToWrite = JSON.parse(JSON.stringify(this.state));

      let documentToEdit = this.state.label;
      /*
      const publicCollectionRef = this.props.firebase.db.collection("packagingPublic");
      await publicCollectionRef.doc(documentToEdit).set('barPublic').then(() => {
        console.log('set public packaging');
      });
      */
      const collectionRef = this.props.firebase.db.collection("bars");
      await collectionRef.doc(documentToEdit).set(barToWrite).then(() => {
        console.log('set bar');
      });

      let state = CONSTS.DEFAULT_BAR;
      this.setState(state);
    }
  }

  async updateBarSelection(barIdSelected, barData) {
    this.itemSelectedForEdit = false;
    let state = CONSTS.DEFAULT_BAR;

    if (barData && barIdSelected) {
      state = barData[barIdSelected];
      if (state && barIdSelected) {
        this.itemSelectedForEdit = true;
      }
    }
    await this.setState(state);
  }

  async setSelected(categorySelection) {
    await this.setState({categorySelection});
    let category = '';
    if (categorySelection.length > 0) {
      category = categorySelection[0].value;
      await this.setState({category});
    }
  }

  onUpdateBatchesSelection(batchSelection) {
    let batchesPctIncluded = batchSelection;
    this.setState({batchesPctIncluded});
  }

  render() {
    return (
      <div>
        <FirebaseContext.Consumer>
          {firebase =>
              <LookupSelection
                firebase={firebase}
                onUpdateSelection={this.updateBarSelection}
                collectionName="bars"
                displayTitle="Bars"
                allowMultiple={false}
                sendDataOnUpdate={true}
              />
            }
        </FirebaseContext.Consumer>
        <div className="barAddEditOutterContainer">
          <BatchesIncluded itemSelectedForEdit={this.itemSelectedForEdit} batchesPctIncluded={this.state.batchesPctIncluded} onUpdate={this.onUpdateBatchesSelection} />
          <br />
          Label:  <input name="label"  onChange={this.onUpdateDetails} value={this.state.label} size="30" placeholder="" type="text"></input><br />
          Notes: <textarea name="notes"  onChange={this.onUpdateDetails} value={this.state.notes} type="text"></textarea><br />
          <button onClick={this.setBar}>Add Bar</button>
        </div>
      </div>
    );
  }
}

export default AddEditBar;

/*


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
          */
