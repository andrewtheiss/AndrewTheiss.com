import React from 'react';
import MultiSelect from "react-multi-select-component";

/**
 *  LookupSelection
 *
 *  Input Props:
 *  firebase              :  firebase consumer context object
 *  onUpdateSelection     :  method to call on any selection change
 *  collectionName        : name of the collection to lookup/select
 *  allowMultiple         : (optional) allow selection of multiple ** NOT PROGRAMMED
 *
 *
 *  Usage:
 *  <LookupSelection
        firebase={firebase}
        onUpdateSelection={this.onUpdateSelection}
        collectionName={"Beans"}
        allowMultiple={true}

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

  setSelected(allSelectedItems) {
    this.setState({ collectionSelected : allSelectedItems});
    if (this.props.onSelectBatch && allSelectedItems.length > 0) {
      this.onSelectBatch(allSelectedItems[0].label);
    } else {
      this.props.onUpdateSelection(undefined);
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
      <div>
      Select
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
