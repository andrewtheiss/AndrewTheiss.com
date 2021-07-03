import React from 'react';
import MultiSelect from "react-multi-select-component";
import './Lookup.css'

class BarLookupSelection extends React.Component {

  constructor(props) {
    super(props);

    this.setSelected = this.setSelected.bind(this);
    this.state = {
      selected : {},
      setSelected : undefined
    };
  }
  setSelected(event) {
    console.log(event, this.state.selected);

  }
//  const [this.selected, setSelected] = useState([]);
  render() {
    let self = this;
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
        <h1>Select Fruits</h1>
        <pre>{JSON.stringify(self.state)}</pre>
        <MultiSelect
          options={options}
          onChange={this.setSelected}
          labelledBy="Select"
        />
      </div>

    );

  }


}

export default BarLookupSelection;


// need to add value={self.state.selected}
