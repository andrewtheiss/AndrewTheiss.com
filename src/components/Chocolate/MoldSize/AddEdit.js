import React from 'react';
import ImageUpload from '../../Utils/ImageUpload.js'
import MultiSelect from "react-multi-select-component";
import * as CONSTS from './constants.js'
/**
 *  AddEditMoldSize
 *
 */
class AddEditMoldSize extends React.Component {
  constructor(props) {
    super(props);
    this.validateMoldSizes = this.validateMoldSizes.bind(this);
    this.updateImage = this.updateImage.bind(this);
    this.onUpdateDetails = this.onUpdateDetails.bind(this);
    this.onUpdateDimensions = this.onUpdateDimensions.bind(this);
    this.toggleCheckbox = this.toggleCheckbox.bind(this);
    this.setMoldSize = this.setMoldSize.bind(this);
    this.formatMoldSizeForSet = this.formatMoldSizeForSet.bind(this);

    this.state = CONSTS.MOLD_SIZE_DEFAULT_PROPS;
  }

  // Somewhere save this.props.batchToEdit.Details.label as this.batchToEditLabel
  componentDidUpdate(prevProps) {
    let isEdit = this.props.itemSelectedForEdit;

    // Only do something if there's a change in the batchToEdit
    if (this.props !== prevProps) {
      let editingBatchLabelMatchesCurrentBatchLabel = true; //this.checkIfEditedLabelMatchCurrentLabel();

      // If there's something to edit or the props don't match the default
      if (isEdit) {
        // Set the batch to edit!
        this.batchToEdit = this.props.batchToEdit;

        // Save the selected label we selected for edit
        if (this.props.batchToEdit.values.Details) {
          this.batchToEditLabel = this.props.batchToEdit.values.Details.label;
        }
        let values = this.props.batchToEdit;
        this.updateBatchDetails(values.values);
      } else if (editingBatchLabelMatchesCurrentBatchLabel) {
          // Continue editing and don't change anything
      } else {
        this.batchToEdit = undefined;
        this.updateBatchDetails(CONSTS.MOLD_SIZE_DEFAULT_PROPS);
      }
    }
  }

  async onUpdateDetails(event) {
    var state = this.state;
    state[event.target.name] = event.target.value;
    await this.setState(state);
  }

  async onUpdateDimensions(event) {
    var state = this.state;
    state['barDimensionsInMm'][event.target.name] = event.target.value;
    await this.setState(state);
  }

  async toggleCheckbox(event) {
    var state = this.state;
    state[event.target.name] = event.target.checked;
    await this.setState(state);
  }

  updateImage(imageUpload) {
    let imageBase64 = imageUpload.image;
    this.setState({imageBase64});
  }

  async formatMoldSizeForSet() {
    // Set label
    let label =  this.state.barWeightInGrams + "g - " + this.state.barLabel;
    await   this.setState({label});

    return {
      label : this.state.label,
      imageBase64 : this.state.imageBase64,
      barWeightInGrams : this.state.barWeightInGrams
    };
  }

  validateMoldSizes() {
    let valid = true;
    let alertStr = "";

    if (!this.state.barLabel) {
      valid = false;
      alertStr = 'You must enter a valid label.';
    }

    if (!this.state.barWeightInGrams) {
      valid = false;
      alertStr = 'You must enter a bar weight.';
    }

    if (!valid) {
      alert(alertStr);
    }

    return valid;
  }

  async setMoldSize() {
    if (this.validateMoldSizes()) {
      let publicMoldSize = await this.formatMoldSizeForSet();

      let documentToEdit = this.state.label;
      const publicCollectionRef = this.props.firebase.db.collection("moldSizePublic");
      await publicCollectionRef.doc(documentToEdit).set(publicMoldSize).then(() => {
        console.log('set public mold size');
      });
      const collectionRef = this.props.firebase.db.collection("moldSize");
      await collectionRef.doc(documentToEdit).set(this.state).then(() => {
        console.log('set mold size');
      });

      let state = CONSTS.MOLD_SIZE_DEFAULT_PROPS;
      this.setState(state);
    }
  }

  render() {
    return (
      <div>
      Bar Label:  <input name="barLabel"  onChange={this.onUpdateDetails} value={this.state.barLabel} size="30" placeholder="12-Piece Break Up Bar (4x3)" type="text"></input>*Weight is Prepended on Save<br />
      Mold Label:  <input name="moldLabel"  onChange={this.onUpdateDetails} value={this.state.moldLabel} size="30" placeholder="Proline Break Up Bar Mold – 12 Breaks" type="text"></input><br />
      Bars Per Mold: <input name="barsPerMold"  onChange={this.onUpdateDetails} value={this.state.barsPerMold} size="3" type="text"></input><br />
      Bar Piece Count: <input name="barPieceCount"  onChange={this.onUpdateDetails} value={this.state.barPieceCount} size="3" type="text"></input><br />
      Gram Weight Per Bar: <input name="barWeightInGrams"  onChange={this.onUpdateDetails} value={this.state.barWeightInGrams} size="5" type="text"></input><br />
      Dimensions (mm):
      X:<input name="x"  onChange={this.onUpdateDimensions} value={this.state.barDimensionsInMm.x} size="2" type="text"></input>
      Y:<input name="y"  onChange={this.onUpdateDimensions} value={this.state.barDimensionsInMm.y} size="2" type="text"></input>
      Z:<input name="z"  onChange={this.onUpdateDimensions} value={this.state.barDimensionsInMm.z} size="2" type="text"></input> <br />
      Mold Count Owned: <input name="moldCountOwned"  onChange={this.onUpdateDetails} value={this.state.moldCountOwned} size="3" type="text"></input><br />
      Used Often: <input name="usedOften"  onChange={this.toggleCheckbox} value={this.state.usedOften} type="checkbox"></input><br />
      Purchased From URL: <input name="purchaseFromUrl"  onChange={this.onUpdateDetails} value={this.state.purchaseFromUrl} type="text"></input><br />
      Cameo Print File Location: <input name="packagingCameoPrintFileLocation"  onChange={this.onUpdateDetails} value={this.state.packagingCameoPrintFileLocation} type="text"></input><br />
      CAD File Location: <input name="packagingCadFileLocation"  onChange={this.onUpdateDetails} value={this.state.packagingCadFileLocation} type="text"></input><br />
      Notes: <textarea name="notes"  onChange={this.onUpdateDetails} value={this.state.notes} type="text"></textarea><br />
      <ImageUpload
        onUpdate={this.updateImage}
        image={this.state.image}
        allowedSize={50000}
      />
      <button onClick={this.setMoldSize}>Add Mold</button>
      </div>
    );
  }
}

export default AddEditMoldSize;
