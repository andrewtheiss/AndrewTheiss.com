import React from 'react';
import MultiSelect from "react-multi-select-component";
import './Batch.css'

class BatchDetails extends React.Component {
  constructor(props) {
    super(props);
    this.onUpdateDetails = this.onUpdateDetails.bind(this);
    this.toggleCheckbox = this.toggleCheckbox.bind(this);
    this.formatIntentionOptions = this.formatIntentionOptions.bind(this);
    this.setSelected = this.setSelected.bind(this);

    this.state = {
      label : '000-2021-00A',
      creation : '2021-02-07',
      grindInHours : 48,
      intention : [],
      comments : '',
      archive : false
    };
    this.props.onChangeDetails(this.state);
    this.intentionOptions = [];
  }

  componentDidMount = () => {
    const intentionCollectionRef = this.props.firebase.db.collection("intention");
    //let self = this;
    intentionCollectionRef.get().then(function(intentionCollectionDocs) {
      /*
      var intentionMap = {};
      var barOptions = [];
      barCollectionDocs.forEach(function(doc) {
        barsMap[doc.id] = doc.data();
        barOptions.push({label:doc.id, value : doc.data()['chocolate']});
      });

      let intentionOptions = self.formatIntentionOptions();
      self.setState({
        bars : barsMap,
        barOptions : barOptions
      });
      */
    });

  }

  async onUpdateDetails(event) {
    var state = this.state;
    state[event.target.name] = event.target.value;
    await this.setState(state);
    this.props.onChangeDetails(this.state);
  }

  setSelected(selectedIntention) {
    this.setState({ intention : selectedIntention});
  }

  toggleCheckbox() {
    let isChecked = !this.state.includeOlderChocolates;
    this.setState({includeOlderChocolates : isChecked});
  }

  formatIntentionOptions(intentionMap) {
   var intentionOptions = [];
    let keys = Object.keys(intentionMap);
     for (var i = 0; i < keys.length; i++) {
       intentionOptions.push({label : keys[i], value : keys[i]});
     }
     return intentionOptions;
  }


  render() {
    return (
      <div>
        Label: <input name="label" value={this.state.label} onChange={this.onUpdateDetails}  type="text"></input><br />
        Creation: <input name="creation" onChange={this.onUpdateDetails} value={this.state.creation} type="date"></input><br />
        Grind In Hours: <input name="grindInHours"  onChange={this.onUpdateDetails} value={this.state.grindInHours} type="text"></input><br />
        Archive: <input name="archive"  onChange={this.toggleCheckbox} value={this.state.grindInHours} type="checkbox"></input><br />
        <div className="fl">Comments: </div><textarea rows="2" cols="40" name="notes"  onChange={this.onUpdateDetails}  value={this.state.notes} type="textarea"></textarea><br />
        <div className="batchCreationDetailsIntentionSelection">
        Intention(s):
        <MultiSelect
          options={this.intentionOptions}
          value={this.state.intention}
          onChange={this.setSelected}
          labelledBy="Select"
        />
        </div>
        <br />
       </div>
    );
  }
}

export default BatchDetails;
