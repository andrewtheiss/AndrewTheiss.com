import React from 'react';
import MultiSelect from "react-multi-select-component";

class BatchDetails extends React.Component {
  constructor(props) {
    super(props);
    this.onUpdateDetails = this.onUpdateDetails.bind(this);
    this.state = {
      label : '000-2021-00A',
      creation : '2021-02-07',
      grindInHours : 48,
      intention : {},
      comments : ''
    };
    this.props.onChangeDetails(this.state);
  }

  componentDidMount = () => {
    const intentionCollectionRef = this.props.firebase.db.collection("intention");
    let self = this;
    intentionCollectionRef.get().then(function(intentionCollectionDocs) {
      /*
      var barsMap = {};
      var barOptions = [];
      barCollectionDocs.forEach(function(doc) {
        barsMap[doc.id] = doc.data();
        barOptions.push({label:doc.id, value : doc.data()['chocolate']});
      });

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

  onUpdateWeight

  render() {
    return (
      <div>
        Batch Details
        <br />
        Label: <input name="label" value={this.state.label} onChange={this.onUpdateDetails}  type="text"></input><br />
        Creation: <input name="creation" onChange={this.onUpdateDetails} value={this.state.creation} type="date"></input><br />
        Grind In Hours: <input name="grindInHours"  onChange={this.onUpdateDetails} value={this.state.grindInHours} type="text"></input><br />
        <div className="fl">Comments: </div><textarea rows="2" cols="40" name="notes"  onChange={this.onUpdateDetails}  value={this.state.notes} type="textarea"></textarea><br />
        Intention(s):
        <br />
       </div>
    );
  }
}

export default BatchDetails;
