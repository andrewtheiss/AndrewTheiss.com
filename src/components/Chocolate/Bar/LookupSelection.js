import React from 'react';
import MultiSelect from "react-multi-select-component";
import './Lookup.css'

class BarLookupSelection extends React.Component {

  constructor(props) {
    super(props);
    console.log('props',props.bars);
    this.setSelected = this.setSelected.bind(this);
    this.toggleCheckbox = this.toggleCheckbox.bind(this);
    this.state = {
      bars : {},
      barOptions: [],
      selected : [],
      includeOlderChocolates : false,
      setSelected : undefined
    };
  }

    // Get all bars from the database
    // TODO - Filter bars by creation date to only grab newer bars
    componentDidMount = () => {
      const barsCollectionRef = this.props.firebase.db.collection("bars");
      let self = this;
      barsCollectionRef.get().then(function(barCollectionDocs) {
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
      });

    }
  setSelected(allSelectedItems) {
    this.setState({ selected : allSelectedItems});
  }
  toggleCheckbox() {
    let isChecked = !this.state.includeOlderChocolates;
    this.setState({includeOlderChocolates : isChecked});
  }
//  const [this.selected, setSelected] = useState([]);
  render() {
    console.log(this.state.bars);
    const options = [
      { label: "Grapes 🍇", value: "grapes" },
      { label: "Mango 🥭", value: "mango" },
      { label: "Strawberry 🍓", value: "strawberry", disabled: true },
      { label: "Watermelon 🍉", value: "watermelon" },
      { label: "Pear 🍐", value: "pear" },
      { label: "Apple 🍎", value: "apple" },
      { label: "Tangerine 🍊", value: "tangerine" },
      { label: "Pineapple 🍍", value: "pineapple" },
      { label: "Peach 🍑", value: "peach" },
    ];

    return(
      <div className="bottomPad5">
        <h1>Chocolate IDs</h1>
        <pre>{JSON.stringify(this.state)}</pre>
        <pre hidden>
          Include Older Chocolates:
          <input type="checkbox" onChange={this.toggleCheckbox} checked={this.state.includeOlderChocolates} />
        </pre>

        <MultiSelect
          options={this.state.barOptions}
          value={this.state.selected}
          onChange={this.setSelected}
          labelledBy="Select"
        />
      </div>

    );

  }


}

export default BarLookupSelection;
