import React from 'react';
import * as CONSTS from './constants.js'
import ImageUpload from '../../Utils/ImageUpload.js'
import FlavorProfile from './FlavorProfile.js'
import LookupSelection from '../../Utils/LookupSelection.js'

class AddEditBean extends React.Component {
  constructor(props) {
    super(props);
    this.setBean = this.setBean.bind(this);
    this.updateImage = this.updateImage.bind(this);
    this.onUpdateDetails = this.onUpdateDetails.bind(this);
    this.onUpdateFlavorProile = this.onUpdateFlavorProile.bind(this);
    this.onUpdateCountrySelection = this.onUpdateCountrySelection.bind(this);

    this.countriesDataOverride = this.formatCountriesForDropdown();
    this.selectedCountryInUse = false;
    this.state = CONSTS.BEAN_DEFAULT_PROPS;
  }

  componentDidUpdate(prevProps) {
    let editExistingItem = this.props.itemSelectedForEdit;

    // Only do something if there's a change in the batchToEdit
    if (this.props !== prevProps) {

      // If there's something to edit or the props don't match the default
      if (editExistingItem) {

        // Save the selected label we selected for edit
        if (this.props.itemSelectedForEdit) {
          this.selectedCountryInUse = true;
          this.setState(this.props.itemSelectedForEdit);
        }
      } else {
        this.selectedCountryInUse = false;
        this.setState(CONSTS.BEAN_DEFAULT_PROPS);
      }
    }
  }

  formatCountriesForDropdown() {
    let collectionMap = [];
    let collectionOptions = [];
    let countries = require('country-data-list').countries;
    countries.all.forEach(function(doc) {
        collectionMap[doc.name] = doc;
        collectionOptions.push({value : doc.name, label : doc.name});
    });

    return {
      collection : collectionMap,
      collectionOptions : collectionOptions
    };
  }

  async onUpdateDetails(event) {
    var state = this.state;
    state[event.target.name] = event.target.value;
    await this.setState(state);
  }

  updateImage(imageUpload) {
    let imageBase64 = imageUpload.image;
    this.setState({imageBase64});
  }

  onUpdateFlavorProile(newProfile) {
    let flavorProfile = newProfile;
    this.setState({flavorProfile});
  }

  onUpdateCountrySelection(selection) {
    let state = {
      country : selection
    };
    this.setState(state);
  }

  async setBean() {

    if (this.state.value) {
      let documentToEdit = this.state.value;
      const publicCollectionRef = this.props.firebase.db.collection("beansPublic");
      await publicCollectionRef.doc(documentToEdit).set(this.state).then(() => {
        console.log('set public beans');
      });
      const collectionRef = this.props.firebase.db.collection("beans");
      await collectionRef.doc(documentToEdit).set(this.state).then(() => {
        console.log('set bean');
      });

      let state = CONSTS.BEAN_DEFAULT_PROPS;
      this.setState(state);
    }
  }

  formatCountryForDropdown() {
    if (this.state.country) {
      return([{name : this.state.country, label : this.state.country}]);
    }
    return '';
  }

  render() {
    this.formattedCountry = this.formatCountryForDropdown();
    return (
      <div>
      Label:  <input name="label"  onChange={this.onUpdateDetails} value={this.state.label} size="30" type="text"></input><br />
      Uniquie DB Value Label:  <input name="value"  onChange={this.onUpdateDetails} value={this.state.value} size="10" type="text"></input><br />
      Display Label:  <input name="displayLabel"  onChange={this.onUpdateDetails} value={this.state.displayLabel} size="20" type="text"></input><br />
      Price: <input name="price"  onChange={this.onUpdateDetails} value={this.state.price} size="6" type="text"></input><br />
      Purchase Lbs: <input name="purchaseLbs"  onChange={this.onUpdateDetails} value={this.state.purchaseLbs} size="6" type="text"></input><br />
      Notes: <textarea name="notes"  onChange={this.onUpdateDetails} value={this.state.notes} type="text"></textarea><br />
      Alchemist Notes: <textarea name="alchemistNotes"  onChange={this.onUpdateDetails} value={this.state.alchemistNotes} type="text"></textarea><br />
      <FlavorProfile flavorProfile={this.state.flavorProfile} onUpdate={this.onUpdateFlavorProile} itemSelectedForEdit={this.props.itemSelectedForEdit}/>
      <LookupSelection
        onUpdateSelection={this.onUpdateCountrySelection}
        staticCollectionDataOverride={this.countriesDataOverride}
        displayTitle="Country"
        allowMultiple={false}
        sendDataOnUpdate={true}
        selectedData={this.formattedCountry}
        selectedDataInUse={this.selectedCountryInUse}
      />
      Country Subcatagory: <input name="countrySubCategory"  onChange={this.onUpdateDetails} value={this.state.countrySubCategory} size="60" type="text"></input><br />

      <ImageUpload onUpdate={this.updateImage} image={this.state.imageBase64} />
      <button onClick={this.setBean}>Update Bean</button>
      </div>
    );
  }
}

export default AddEditBean;
