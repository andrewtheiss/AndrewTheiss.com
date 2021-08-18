import React from 'react';
import * as CONSTS from './constants.js'
import MultiSelect from "react-multi-select-component";

/**
 *  AddEditTasting
 *
 */
class AddEditTasting extends React.Component {
  constructor(props) {
    super(props);
    this.setTasting = this.setTasting.bind(this);
    this.setSelected = this.setSelected.bind(this);
    this.onUpdateDetails = this.onUpdateDetails.bind(this);
    this.setStateAndUpdateParent = this.setStateAndUpdateParent.bind(this);
    this.setTastingSelected = this.setTastingSelected.bind(this);

    this.state = CONSTS.TASTING_DEFAULT_PROPS;
  }

  // Somewhere save this.props.batchToEdit.Details.label as this.batchToEditLabel
  componentDidUpdate(prevProps) {

    // Only do something if there's a change in the batchToEdit
    if (this.props !== prevProps) {
      let isEdit = this.props.itemSelectedForEdit;

      // If there's something to edit or the props don't match the default
      if (isEdit) {
        // Save the selected label we selected for edit
        this.setStateAndUpdateParent(this.props.itemSelectedForEdit);

      } else if (prevProps.itemSelectedForEdit !== this.props.itemSelectedForEdit){
        this.setStateAndUpdateParent(CONSTS.TASTING_DEFAULT_PROPS);

      }
    }
  }

  // Get data from DB in this function
  async componentDidMount() {
    let self = this;

    const collectionRef = this.props.firebase.db.collection("barsPublic");
    await collectionRef.get().then(function(collectionDocs) {
      var allBars = {};
      var allBarsSelectionOptions = [];
      collectionDocs.forEach(function(doc) {
        allBars[doc.id] = doc.data();
        allBarsSelectionOptions.push({label : doc.id, value : doc.id});
      });
      self.setStateAndUpdateParent({
        allBars : allBars,
        allBarsSelectionOptions : allBarsSelectionOptions
      });
    });
  }

  async onUpdateDetails(event) {
    var state = this.state;
    state[event.target.name] = event.target.value;
    await this.setStateAndUpdateParent(state);
  }

  /*  setStateAndUpdateParent
   *    All updates should update parent because the Preview should render exactly the
   *    added tasting state
   */
  async setStateAndUpdateParent(stateObject) {
    await this.setState(stateObject);

    // Every update send only the tasting object to the parent
    let latestTasting = {};
    let tastingObjectKeys = Object.keys(CONSTS.TASTING_DEFAULT_PROPS_OBJECT_FOR_WRITE);
    for (var i in tastingObjectKeys) {
      latestTasting[tastingObjectKeys[i]] = this.state[tastingObjectKeys[i]];
    }
    this.props.onUpdate(latestTasting);
  }

  async setTasting() {

    let documentToEdit = this.state.label;

    let tastingToWrite = JSON.parse(JSON.stringify(this.state));
    delete tastingToWrite['allBars'];
    delete tastingToWrite['allBarsSelectionOptions'];

    const publicCollectionRef = this.props.firebase.db.collection("tastingPublic");
    await publicCollectionRef.doc(documentToEdit).set(tastingToWrite).then(() => {
      console.log('set public tasting');
    });
    const collectionRef = this.props.firebase.db.collection("tasting");
    await collectionRef.doc(documentToEdit).set(tastingToWrite).then(() => {
      console.log('set tasting');
    });

    let state = CONSTS.TASTING_DEFAULT_PROPS;
    this.setStateAndUpdateParent(state);
  }

  // Set Selected Ingredient so we can update the value of their weight in grams
  async setSelected(allSelectedItems) {
    let bars = {};
    for (var i in allSelectedItems) {
      if (this.state.allBars[allSelectedItems[i].label]) {
        bars[allSelectedItems[i].label] = this.state.allBars[allSelectedItems[i].label];
      } else {
        // BAR NOT RETURNED FROM QUERY.. Probably because we finally have bars so old they are not loaded
        // Need to load bar document which is missing if this is the case
        alert('bar not available from initial bar request.  Is it hella old?');
      }
    }
    await this.setStateAndUpdateParent({ bars : bars, barsSelected : allSelectedItems});
  }

  // LIMIT TASTING TYPE TO 1 FOR NOW!
  async setTastingSelected(tastingSelection) {
    let tasting = tastingSelection[0].label;
    await this.setStateAndUpdateParent({tasting : tasting, tastingSelection : tastingSelection});
  }

  render() {
    return (
      <div>
      Tasting Label:  <input name="label"  onChange={this.onUpdateDetails} value={this.state.label} size="30" type="text"></input><br />
      <div className="addEditTastingBarSelectionContainer">
      Bar Selections:
        <MultiSelect
          options={this.state.allBarsSelectionOptions}
          value={this.state.barsSelected}
          onChange={this.setSelected}
          labelledBy="Select"
          hasSelectAll={false}
        />
      </div>
      <div className="addEditTastingTypeContainer">
      Tasting Type:
       <MultiSelect
          options={CONSTS.TASTING_TYPES}
          value={this.state.tastingSelection}
          onChange={this.setTastingSelected}
          labelledBy="Select"
          hasSelectAll={false}
        />
      </div>
      Notes: <textarea name="notes"  onChange={this.onUpdateDetails} value={this.state.notes} type="text"></textarea><br />
      <button onClick={this.setTasting}>Update Tasting</button>
      </div>
    );
  }
}

export default AddEditTasting;
