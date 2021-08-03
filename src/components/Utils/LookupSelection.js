import React from 'react';
import MultiSelect from "react-multi-select-component";
import './Utils.css'
/**
 *  LookupSelection
 *
 *  Input Props:
 *  firebase              :  firebase consumer context object
 *  onUpdateSelection     :  method to call on any selection change
 *  collectionName        : name of the collection to lookup/select
 *  customClass           : class name to be appended to 'defaultLookupSelectionContainer'
 *  allowMultiple         : (optional) allow selection of multiple ** NOT PROGRAMMED
 *  displayTitle          : (optional) display title
 *
 *  Usage:
 *  <LookupSelection
        firebase={firebase}
        onUpdateSelection={this.onUpdateSelection}
        collectionName={"Beans"}
        allowMultiple={true}
        customClass={barSelect}
    />
 *
 *  Notes:
 *
 */
class LookupSelection extends React.Component {
  constructor(props) {
    super(props);
    this.generateSelectedPreview = this.generateSelectedPreview.bind(this);
    this.setSelected = this.setSelected.bind(this);

    this.containerClass = "defaultLookupSelectionContainer";
    this.h3Class = "defaultLookupSelectionHeader"
    if (this.props.customClass) {
      this.containerClass += " " + this.props.customClass;
      this.h3Class += " " + this.props.customClass;
    }

    this.displayTitle = "";
    if (this.props.displayTitle) {
      this.displayTitle = this.props.displayTitle;
    }

    this.state = {
      collection : {},
      collectionSelected : [],
      collectionOptions : [],
      newcollectionDetails : {}
    };
  }

  componentDidMount = async () => {
    const collectionRef = this.props.firebase.db.collection(this.props.collectionName);
    let self = this;
    await collectionRef.get().then(function(collectionDocs) {
      var collectionMap = {};
      var collectionOptions = [];
      collectionDocs.forEach(function(doc) {
        collectionMap[doc.id] = doc.data();
        collectionOptions.push({value : doc.id, label : doc.data().label});
      });

      self.setState({
        collection : collectionMap,
        collectionOptions : collectionOptions
      });
    });
  }

  generateSelectedPreview() {
      return '';
  }

  async setSelected(allSelectedItems) {
    await this.setState({ collectionSelected : allSelectedItems});
    if (this.props.onUpdateSelection) {
      if (allSelectedItems.length > 0) {
        this.onSelectBatch(allSelectedItems[0].value);
      } else {
        this.props.onUpdateSelection(undefined);
      }
    }
  }

  async onSelectBatch(batchId) {
    const latestDocRef = this.props.firebase.db.collection(this.props.collectionName).doc(batchId);
    let self = this;
    await latestDocRef.get().then((doc) => {
        if (doc.exists) {
            self.props.onUpdateSelection(doc.data());
        } else {
            console.log("ERROR - Failed to find batch!");
        }
    }).catch((error) => {
        console.log("Error getting recently batch:", error);
    });
  }

  render() {
    let previewSelected = this.generateSelectedPreview();
    return (
      <div className={this.containerClass} >
        <h3 className={this.h3Class}>Select {this.displayTitle}</h3>
        <MultiSelect
          options={this.state.collectionOptions}
          value={this.state.collectionSelected}
          onChange={this.setSelected}
          labelledBy="Select"
          hasSelectAll={false}
        />
      </div>
    );
  }
}

export default LookupSelection;
