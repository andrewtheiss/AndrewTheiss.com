import React from 'react';
import MultiSelect from "react-multi-select-component";
import ImageUpload from '../../Utils/ImageUpload.js'
import * as CONSTS from './constants.js'
/**
 *  AddEditPackaging
 *
 */
class AddEditPackaging extends React.Component {
  constructor(props) {
    super(props);
    this.validatePackaging = this.validatePackaging.bind(this);
    this.updateImage = this.updateImage.bind(this);
    this.onUpdateDetails = this.onUpdateDetails.bind(this);
    this.toggleCheckbox = this.toggleCheckbox.bind(this);
    this.setPackaging = this.setPackaging.bind(this);
    this.formatPackagingForSet = this.formatPackagingForSet.bind(this);
    this.setSelected = this.setSelected.bind(this);

    this.state = CONSTS.PACKAGING_DEFAULT_DETAILS;
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
        this.setState(CONSTS.PACKAGING_DEFAULT_DETAILS);
      }
    }
  }

  formatSelectedCategory(itemSelectedForEdit) {
    let itemSelected = itemSelectedForEdit;
    itemSelected.categorySelection = [({label : itemSelectedForEdit.category, value : itemSelectedForEdit.category})];
    return itemSelected;
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

  async formatPackagingForSet() {
    let latestAverageCostPerUnit = Math.round(Number(this.state.purchasedPrice / this.state.unitsPerItem)*100)/100 * Number((this.state.percentWaste / 100) + 1);
    await   this.setState({latestAverageCostPerUnit});


    return {
      category : this.state.category,
      label : this.state.label,
      imageBase64 : this.state.imageBase64,
      latestAverageCostPerUnit : this.state.latestAverageCostPerUnit
    };
  }

  validatePackaging() {
    let valid = true;
    let alertStr = "";

    if (!this.state.label) {
      valid = false;
      alertStr = 'You must enter a valid label.';
    }

    if (!this.state.purchasedCount) {
      valid = false;
      alertStr = 'You must enter how many you bought.';
    }
    if (!this.state.purchasedPrice) {
      valid = false;
      alertStr = 'You must enter how much it was.';
    }
    if (!this.state.unitsPerItem) {
      valid = false;
      alertStr = 'You must enter how many units we can package per item bought.';
    }

    if (!this.state.category) {
      valid = false;
      alertStr = 'You must select a category.';
    }

    if (!valid) {
      alert(alertStr);
    }

    return valid;
  }

  async setPackaging() {
    if (this.validatePackaging()) {

      let publicPackaging = await this.formatPackagingForSet();
      let categoryToWrite = JSON.parse(JSON.stringify(this.state));
      delete categoryToWrite['categoryCategories'];
      delete categoryToWrite['categorySelection'];

      let documentToEdit = this.state.label;
      const publicCollectionRef = this.props.firebase.db.collection("packagingPublic");
      await publicCollectionRef.doc(documentToEdit).set(publicPackaging).then(() => {
        console.log('set public packaging');
      });
      const collectionRef = this.props.firebase.db.collection("packaging");
      await collectionRef.doc(documentToEdit).set(categoryToWrite).then(() => {
        console.log('set packaging');
      });

      let state = CONSTS.PACKAGING_DEFAULT_DETAILS;
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

  render() {
    console.log(this.state.imageBase64);
    return (
      <div>
      <div className="packagingCategoryContainer">
      <b>Category: </b><MultiSelect
        options={this.state.categoryCategories}
        value={this.state.categorySelection}
        onChange={this.setSelected}
        labelledBy="Packaging Category"
        hasSelectAll={false}
        disableSearch={true}
      />
      </div>
      Label:  <input name="label"  onChange={this.onUpdateDetails} value={this.state.label} size="30" placeholder="" type="text"></input><br />
      Purcahsed Price: $<input name="purchasedPrice"  onChange={this.onUpdateDetails} value={this.state.purchasedPrice} size="10" type="text"></input><br />
      Count Purchased:  <input name="purchasedCount"  onChange={this.onUpdateDetails} value={this.state.purchasedCount} size="3" placeholder="1" type="text"></input><br />
      Units Per Item: <input name="unitsPerItem"  onChange={this.onUpdateDetails} value={this.state.unitsPerItem} size="3" placeholder="500"  type="text"></input><br />
      Units Per Item Comments: <textarea name="unitsPerItemComments"  onChange={this.onUpdateDetails} value={this.state.unitsPerItemComments} type="text"></textarea><br />
      Percent Waste (for cost calc): <input name="percentWaste"  onChange={this.onUpdateDetails} value={this.state.percentWaste} type="text"></input><br />
      Purchase From Company: <input name="purchaseFromCompany"  onChange={this.onUpdateDetails} value={this.state.purchaseFromCompany} type="text"></input><br />
      Purchase From Url: <input name="purchaseFromUrl"  onChange={this.onUpdateDetails} value={this.state.purchaseFromUrl} type="text"></input><br />
      Notes: <textarea name="notes"  onChange={this.onUpdateDetails} value={this.state.notes} type="text"></textarea><br />
      <ImageUpload
        onUpdate={this.updateImage}
        image={this.state.imageBase64}
        allowedSize={50000}
      />
      <button onClick={this.setPackaging}>Add Packaging</button>
      </div>
    );
  }
}

export default AddEditPackaging;
