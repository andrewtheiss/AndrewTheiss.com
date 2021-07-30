import React from 'react';
import MultiSelect from "react-multi-select-component";
import './Batch.css'

class LookupChocolateBatch extends React.Component {
  constructor(props) {
    super(props);
    this.onSelectBatch = this.onSelectBatch.bind(this);
    this.setSelected = this.setSelected.bind(this);
    this.toggleCheckbox = this.toggleCheckbox.bind(this);
    this.state = {
      batches : {},
      batchOptions: [],
      selected : [],
      includeOlderBatches : false,
      setSelected : undefined
    };
  }

  // Get data from DB in this function
  componentDidMount = () => {
    const batchesCollectionRef = this.props.firebase.db.collection("batchesPublic");
    let self = this;
    batchesCollectionRef.get().then(function(batchesCollectionDocs) {
      var batchesMap = {};
      batchesCollectionDocs.forEach(function(doc) {
        batchesMap[doc.id] = doc.data();
      });

      let batchOptions = self.formatBatchOptions(batchesMap);

      self.setState({
        batches : batchesMap,
        batchOptions : batchOptions
      });
    });

  }

  setSelected(allSelectedItems) {
    this.setState({ selected : allSelectedItems});
    if (this.props.onSelectBatch && allSelectedItems.length > 0) {
      this.onSelectBatch(allSelectedItems[0].label);
    } else {
      this.props.onSelectBatch(undefined);
    }
  }

  toggleCheckbox() {
    let isChecked = !this.state.includeOlderChocolates;
    this.setState({includeOlderChocolates : isChecked});
  }

  formatBatchOptions(batchesMap) {
   var batchOptions = [];
    let keys = Object.keys(batchesMap);
     for (var i = 0; i < keys.length; i++) {
       batchOptions.push({label : keys[i], value : keys[i]});
     }
     return batchOptions;
  }

  onSelectBatch(batchId) {
      const latestDocRef = this.props.firebase.db.collection("batches").doc(batchId);
      let self = this;
      latestDocRef.get().then((doc) => {
          if (doc.exists) {
              console.log("Document data:", doc.data());
              self.props.onSelectBatch(doc.data());
          } else {
              console.log("ERROR - Failed to find batch!");
          }
      }).catch((error) => {
          console.log("Error getting recently batch:", error);
      });
  }

  render() {
    return (
      <div className="batchLookupContainer">
        <h2>Batch Lookup</h2>
        <pre hidden>
          Advanced Search:
          <input type="checkbox" onChange={this.toggleCheckbox} checked={this.state.includeOlderBatches} />
        </pre>
        <div className="advancedSearch">

        </div>
        <MultiSelect
          options={this.state.batchOptions}
          value={this.state.selected}
          onChange={this.setSelected}
          labelledBy="Select"
        />
      </div>

    )
  };
};

export default LookupChocolateBatch;
