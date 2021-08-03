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
    this.generateSelectedPreview = this.generateSelectedPreview.bind(this);
    this.updateImage = this.updateImage.bind(this);
    this.onUpdateDetails = this.onUpdateDetails.bind(this);
    this.toggleCheckbox = this.toggleCheckbox.bind(this);

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

  generateSelectedPreview() {
      return '';
  }

  async onUpdateDetails(event) {
    var state = this.state;
    state[event.target.name] = event.target.value;
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

  render() {
    let previewSelected = this.generateSelectedPreview();
    return (
      <div>
      Mold Label:  <input name="label"  onChange={this.onUpdateDetails} value={this.state.label} placeholder="50 Gram - 4bar Square" type="text"></input><br />
      Size Label:  <input name="sizeLabel"  onChange={this.onUpdateDetails} value={this.state.label} placeholder="50 Gram Rectangle Bar" type="text"></input><br />
      Bars Per Mold: <input name="barsPerMold"  onChange={this.onUpdateDetails} value={this.state.barsPerMold} type="text"></input><br />
      Gram Weight Per Bar: <input name="gramWeightPerBar"  onChange={this.onUpdateDetails} value={this.state.gramWeightPerBar} type="text"></input><br />
      Mold Count Owned: <input name="moldCountOwned"  onChange={this.onUpdateDetails} value={this.state.moldCountOwned} type="text"></input><br />
      Used Often: <input name="usedOften"  onChange={this.toggleCheckbox} value={this.state.usedOften} type="checkbox"></input><br />
      Purchased From URL: <input name="purchaseFromUrl"  onChange={this.onUpdateDetails} value={this.state.purchaseFromUrl} type="text"></input><br />
      Cameo Print File Location: <input name="packagingCameoPrintFileLocation"  onChange={this.onUpdateDetails} value={this.state.packagingCameoPrintFileLocation} type="text"></input><br />
      CAD File Location: <input name="packagingCadFileLocation"  onChange={this.onUpdateDetails} value={this.state.packagingCameoPrintFileLocation} type="text"></input><br />
      <ImageUpload
        onUpdate={this.updateImage}
        image={this.state.image}
        allowedSize={50000}
      />
      <button>Add Mold</button>
      </div>
    );
  }
}

export default AddEditMoldSize;
