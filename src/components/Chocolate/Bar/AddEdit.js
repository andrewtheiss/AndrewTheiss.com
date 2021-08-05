import React from 'react';
import MultiSelect from "react-multi-select-component";
import ImageUpload from '../../Utils/ImageUpload.js'
import * as CONSTS from './constants.js'
import { FirebaseContext } from '../../Firebase';
import LookupSelection from '../../Utils/LookupSelection.js'
/**
 *  AddEditBar
 *
 */
class AddEditBar extends React.Component {
  constructor(props) {
    super(props);

    this.state = {

    }
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
    let latestAverageCostPerUnit = Math.round(Number(this.state.purchasedPrice / this.state.unitsPerItem)*100)/100 * Number((this.state.percentWaste / 100) + 1);
    await   this.setState({latestAverageCostPerUnit});


    return {
      category : this.state.category,
      label : this.state.label,
      imageBase64 : this.state.imageBase64,
      latestAverageCostPerUnit : this.state.latestAverageCostPerUnit
    };
  }

  validateBar() {
    let valid = true;
    let alertStr = "";

    if (!valid) {
      alert(alertStr);
    }
    return valid;
  }

  async setBar() {
    if (this.validateBar()) {

      let publicBar = await this.formatBarForSet();
      let barToWrite = JSON.parse(JSON.stringify(this.state));

      let documentToEdit = this.state.label;
      const publicCollectionRef = this.props.firebase.db.collection("packagingPublic");
      await publicCollectionRef.doc(documentToEdit).set('barPublic').then(() => {
        console.log('set public packaging');
      });
      const collectionRef = this.props.firebase.db.collection("packaging");
      await collectionRef.doc(documentToEdit).set('bar').then(() => {
        console.log('set packaging');
      });

      let state = CONSTS.DEFAULT_BAR;
      this.setState(state);
    }
  }

  async setSelected(categorySelection) {
    await this.setState({categorySelection});
    let category = '';
    if (categorySelection.length > 0) {
      category = categorySelection[0].value;
      await this.setState({category});
    }
  }

  /**
   *  onUpdateBatchSelection
   *
   *  Usage:
   *  - Default is a single selection auto set to 100% of the batch used
   *  - Unrelated to which bar molds are used (can use one mixed batch into a bunch of molds)
   *
   *  Note:
   *  We may want to support 25% of one batch and 75% of another mixed in the same
   */
  onUpdateBatchSelection(batchSelection) {
    console.log('select batch');
  }

  render() {
    return (
      <div className="barAddEditOutterContainer">
        <div className="barBatchSelection">
        <FirebaseContext.Consumer>
          {firebase =>
              <LookupSelection
                firebase={firebase}
                onUpdateSelection={this.onUpdateBatchSelection}
                collectionName="batchesPublic"
                displayTitle="Batches Public"
                allowMultiple={true}
                sendDataOnUpdate={true}
              />
            }
        </FirebaseContext.Consumer>
        </div>
        Label:  <input name="label"  onChange={this.onUpdateDetails} value={this.state.label} size="30" placeholder="" type="text"></input><br />
        Notes: <textarea name="notes"  onChange={this.onUpdateDetails} value={this.state.notes} type="text"></textarea><br />
        <button onClick={this.setBar}>Add Bar</button>
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
