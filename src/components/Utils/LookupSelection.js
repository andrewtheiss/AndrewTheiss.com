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
 *  allowMultiple         : (optional) returns Array of all selected instead of single
 *  sendDataOnUpdate      : (optional) returns second parameter back which is the collectionData
 *  displayTitle          : (optional) display title
 *  selectedData          : (optional) data already selected
 *
       if (self.props.immediatelyUpdateBatchData) {
         self.props.immediatelyUpdateBatchData(collection);
       }


 *  Usage:
 *  <LookupSelection
        firebase={firebase}
        onUpdateSelection={this.onUpdateSelection}
        collectionName={"Beans"}
        allowMultiple={true}
        sendDataOnUpdate={true}
        customClass={barSelect}
        selectedData={alreadySelected}
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

    let selectedData = [];
    if (this.props.selectedData) {
      selectedData = this.props.selectedData;
    }

    this.displayTitle = "";
    if (this.props.displayTitle) {
      this.displayTitle = this.props.displayTitle;
    }

    this.state = {
      collection : {},
      collectionSelected : selectedData,
      collectionOptions : [],
      newcollectionDetails : {}
    };
  }

  componentDidMount = async () => {
    let collectionRef = this.props.firebase.db.collection(this.props.collectionName);
    if (this.props.customSearch) {
      collectionRef = this.props.customSearch;
    }

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

      if (self.props.immediatelyUpdateBatchData) {
        self.props.immediatelyUpdateBatchData(collectionMap);
      }
    });
  }

  componentDidUpdate(prevProps) {
    let overrideCurrentSelectedData = this.props.selectedDataInUse;

    // Only do something if there's a change in the batchToEdit
    if (this.props !== prevProps) {

      // If there's something to edit or the props don't match the default
      if (overrideCurrentSelectedData) {

        this.setState({
          collectionSelected : this.props.selectedData
        });
      }
    }
  }

  generateSelectedPreview() {
      return '';
  }

  async setSelected(allSelectedItems) {
    await this.setState({ collectionSelected : allSelectedItems});
    if (this.props.onUpdateSelection) {
      if (allSelectedItems.length > 0) {

        // Multiple selection returns the whole array
        if (this.props.allowMultiple) {

            // See if we send data back with the call or not
            if (this.props.sendDataOnUpdate) {
              this.props.onUpdateSelection(allSelectedItems, this.state.collection);
            } else {
              this.props.onUpdateSelection(allSelectedItems);
            }
        } else {

          // See if we send data back with the call or not
          if (this.props.sendDataOnUpdate) {
            this.props.onUpdateSelection(allSelectedItems[0].value, this.state.collection);
          } else {
            this.props.onUpdateSelection(allSelectedItems[0].value);
          }

        }
      } else {
        this.props.onUpdateSelection([]);
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
    let title = <h3 className={this.h3Class}>Select {this.displayTitle}</h3>;
    if (!this.displayTitle) {
      title = "";
    }
    return (
      <div className={this.containerClass} >
        {title}
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
