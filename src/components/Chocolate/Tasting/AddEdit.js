import React from 'react';
import * as CONSTS from './constants.js'
import MultiSelect from "react-multi-select-component";
import ImageUploadStorage from "../../Utils/ImageUploadStorage.js"

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
    this.setTastingTypeSelected = this.setTastingTypeSelected.bind(this);
    this.setDifficultySelected = this.setDifficultySelected.bind(this);
    this.formatTastingTypeAndBarSelections = this.formatTastingTypeAndBarSelections.bind(this);
    this.onUpdateImageDimensions = this.onUpdateImageDimensions.bind(this);

    this.state = CONSTS.TASTING_DEFAULT_PROPS;
  }

  // Somewhere save this.props.batchToEdit.Details.label as this.batchToEditLabel
  componentDidUpdate(prevProps) {

    // Only do something if there's a change in the batchToEdit
    if (this.props.itemSelectedForEdit !== prevProps.itemSelectedForEdit) {
      let isEdit = this.props.itemSelectedForEdit;

      // If there's something to edit or the props don't match the default
      if (isEdit) {
        // Save the selected label we selected for edit
        this.formatTastingTypeAndBarSelections();

      } else if (prevProps.itemSelectedForEdit !== this.props.itemSelectedForEdit){
        this.setStateAndUpdateParent(CONSTS.TASTING_DEFAULT_PROPS);

      }
    }
  }

  formatTastingTypeAndBarSelections() {
    let tastingTypeSelection = [{label : this.props.itemSelectedForEdit.type, value : this.props.itemSelectedForEdit.type}];
    let barsSelected = [];

    let bars = this.props.itemSelectedForEdit.bars;
    let barKeys = Object.keys(bars);
    for (var i in barKeys) {
        barsSelected.push({label : barKeys[i], value : barKeys[i]});
    }
    let itemSelectedForEdit = this.props.itemSelectedForEdit;
    itemSelectedForEdit['tastingTypeSelection'] = tastingTypeSelection;
    itemSelectedForEdit['barsSelected'] = barsSelected;
    this.setStateAndUpdateParent(itemSelectedForEdit);
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

  async onUpdateImageDimensions(event) {
    var state = this.state;
    let imageDimensions = state.imageDimensions;
    if (imageDimensions) {
      imageDimensions[event.target.name] = event.target.value;
      await this.setStateAndUpdateParent(state);
    }
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
    delete tastingToWrite['barsSelected'];
    delete tastingToWrite['tastingTypeSelection'];
    delete tastingToWrite['difficultySelection'];
    delete tastingToWrite['allBarsSelectionOptions'];

    // Delete all bean image data
    Object.keys(tastingToWrite.bars).forEach(function(barId) {
      let beans = tastingToWrite.bars[barId].beans;
      Object.keys(beans).forEach(function(beanId) {
        delete tastingToWrite.bars[barId].beans[beanId]['imageBase64'];
      });
    });

    const publicCollectionRef = this.props.firebase.db.collection("tastingPublic");
    await publicCollectionRef.doc(documentToEdit).set(tastingToWrite).then(() => {
      console.log('set public tasting');
    });

    // For other website we want all tastings to be in a single namespace
   const publicChocolateCollectionRef = this.props.firebase.writeOnlyChocolateDb.collection("tastings");
   await publicChocolateCollectionRef.doc(documentToEdit).set(tastingToWrite).then(() => {
      console.log('set public tasting for chocolate site');
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

  // LIMIT Difficulty TYPE TO 1 FOR NOW!
  async setDifficultySelected(difficultySelection) {
    let difficulty = '';
    if (difficultySelection.length > 0) {
      difficulty = difficultySelection[0].label;
    }

    await this.setStateAndUpdateParent({
      difficulty : difficulty,
      difficultySelection : difficultySelection
    });
  }

  // LIMIT TASTING TYPE TO 1 FOR NOW!
  async setTastingTypeSelected(tastingTypeSelection) {
    let type = '';
    if (tastingTypeSelection.length > 0) {
      type = tastingTypeSelection[0].label;
    }


    if (!this.state.notes && type) {
      let notes = "";
      let notesMinor = "";
      switch (type) {
        case "Sweetener":
          notes = "Taste the sweetness between these bars!";
          notesMinor = "(Other ingredient discrepancies are to ensure bar integrity...)";
          break;
        case "Dairy":
          notes = "Taste the milk difference between these bars!  ";
          notesMinor = "Each has the same ingredients apart from the type of milk powder.";
          break;
        case "Cacao":
          notes = "Taste the chocolate bean difference!";
          notesMinor = " Each bean should have a fairly distinct taste and hopefully you have a preference!";
          break;
        default:
          break;
      }
      notesMinor += " Bon Appetit!"

      await this.setStateAndUpdateParent({
        notes : notes,
        notesMinor : notesMinor,
        type : type,
        tastingTypeSelection : tastingTypeSelection
      });
    } else {
      await this.setStateAndUpdateParent({type : type, tastingTypeSelection : tastingTypeSelection});
    }
  }

  updateImage() {
    console.log('image updated');
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
          value={this.state.tastingTypeSelection}
          onChange={this.setTastingTypeSelected}
          labelledBy="Select"
          hasSelectAll={false}
        />
      </div>
      Notes: <textarea name="notes" className="tastingPreviewNotes" onChange={this.onUpdateDetails} value={this.state.notes} type="text"></textarea><br />
      Notes Minor: <textarea name="notesMinor" className="tastingPreviewNotesMinor" onChange={this.onUpdateDetails} value={this.state.notesMinor} type="text"></textarea><br />

      <div className="addEditTastingTypeContainer">
      Difficulty:
       <MultiSelect
          options={CONSTS.TASTING_DIFFICULTY}
          value={this.state.difficultySelection}
          onChange={this.setDifficultySelected}
          labelledBy="Select"
          hasSelectAll={false}
        />
      </div>
      Tasting Order (Alphabetical to Selection) Map: <input placeholder="4,3,0,2,1" type="text" name="barAlphabeticalToTastingOrderMap" className="barAlphabeticalToTastingOrderMap" onChange={this.onUpdateDetails} value={this.state.barAlphabeticalToTastingOrderMap}/><br />
      Image Dimensions  
        X:<input type="text" name="x" className="imageDimensionsX" onChange={this.onUpdateImageDimensions} value={this.state.imageDimensions.x}/>
        Y:<input type="text" name="y" className="imageDimensionsY" onChange={this.onUpdateImageDimensions} value={this.state.imageDimensions.y}/>
      <ImageUploadStorage firebase={this.props.firebase} onUpdate={this.updateImage} tastingLabel={this.state.label} />
      <button onClick={this.setTasting}>Update Tasting</button>
      </div>
    );
  }
}

export default AddEditTasting;
