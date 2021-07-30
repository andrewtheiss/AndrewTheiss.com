import React from 'react';
import { withFirebase } from '../../../Firebase';
import RoastSelection from './Roast.js'
import RoastFinal from './RoastFinal.js'
import * as CONSTS from '../constants.js'
import '../../Theme/main.css';
import MultiSelect from "react-multi-select-component";

/**
 *  BeanPreparation handles all bean details for a chocolate inc:
 *
 *  - Bean ID, Weight, Oven Roast Temps
 */
class BeanPreparation extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      options : '',
      beans : [],
      beanOptions : [],
      selected : [],
      latestBean : CONSTS.BEAN_DEFAULT
    };
    this.validateBean = this.validateBean.bind(this);
    this.setSelected = this.setSelected.bind(this);
    this.componentDidMount = this.componentDidMount.bind(this);
    this.addBean = this.addBean.bind(this);
    this.onChangeBeanWeight = this.onChangeBeanWeight.bind(this);
    this.onChangenibWeight = this.onChangenibWeight.bind(this);
    this.renderRoastTimeTemps = this.renderRoastTimeTemps.bind(this);
    this.renderFinalTemp = this.renderFinalTemp.bind(this);
    this.onChangeRoast = this.onChangeRoast.bind(this);
    this.onChangeRoastFinalTemps = this.onChangeRoastFinalTemps.bind(this);
    this.onAddRoast = this.onAddRoast.bind(this);
    this.onRemoveRoast = this.onRemoveRoast.bind(this);
  }
  componentDidMount() {
    const beansCollectionRef = this.props.firebase.db.collection("beans");
    let self = this;
    beansCollectionRef.get().then(function(beanCollectionDocs) {
      var beansMap = {};
      var beanOptions = [];
      beanCollectionDocs.forEach(function(doc) {
        beansMap[doc.id] = doc.data();
        beanOptions.push({
          label : doc.data()['name'],
          value : doc.id,
          pricePerKilogram : self.pricePerLbToKilogramConversion(doc.data()['price'],doc.data()['purchaseLbs'])
        });
      });

      self.setState({
        beans : beansMap,
        beanOptions : beanOptions
      });
    });
  }

  pricePerLbToKilogramConversion(pricePerLb, purchaseLbs) {
    const lbsPerKg = 0.453592;
    return (pricePerLb/purchaseLbs)*(1.0/lbsPerKg);
  }

    // Set Selected Ingredient so we can update the value of their weight in grams
    async setSelected(allSelectedItems) {
      await this.setState({ selected : allSelectedItems});
    }

  renderRoastTimeTemps() {
    let roastTimeTemp = '';
    let roast = this.state.latestBean.roast;
    var self = this;
    if (!roast || Object.keys(roast).length === 0) {
        roastTimeTemp = <RoastSelection key="0" input={CONSTS.ROAST_INITIAL} index="0" name="beans" onChangeRoast={this.onChangeRoast} onAddRoast={this.onAddRoast} onRemoveRoast={this.onRemoveRoast} />;
    } else {
    // Creating a unique key forces re-render ONLY each time length is changed
      var rand = Object.keys(roast).length/3.14159;

      roastTimeTemp = Object.keys(roast).map((roastTime, index) => (
        <RoastSelection
         key={index + rand}
         input={roast[index]}
         index={index}
         name="beans"
         roastIndex={index}
         onChangeRoast={self.onChangeRoast}
         onAddRoast={self.onAddRoast}
         onRemoveRoast={self.onRemoveRoast}
       />
      ));
    }
    return roastTimeTemp;
  }

  renderFinalTemp() {
    let roastFinalTemps = this.state.latestBean.finalTemps;
    let self = this;
    return <RoastFinal
       key="roastFinal"
       input={roastFinalTemps}
       name="beans"
       onChangeRoastFinalTemps={self.onChangeRoastFinalTemps}
     />
  }

  async onChangeRoast(roastIndex, roastData) {
    let latestBean = this.state.latestBean;
    latestBean.roast[roastIndex] = roastData;
    await this.setState({ latestBean });
  }

  async onChangeRoastFinalTemps(roastFinalTemp) {
    let latestBean = this.state.latestBean;
    latestBean.finalTemp = roastFinalTemp;
    await this.setState({ latestBean });
  }

  async onAddRoast(roastIndex) {
    let newRoastLocation = roastIndex+1;
    let latestBean = this.state.latestBean;
    let objectArraySize = Object.keys(latestBean.roast).length;
    let tempReadyToInsert = CONSTS.ROAST_EMPTY;
    let tempNeedToSave = {};
    for (var i = newRoastLocation; i < objectArraySize+1; i++) {    // Start at the tail end and bubble all the objects down
      if (latestBean.roast[i]) {      // If the desired insert location is not blank..
        tempNeedToSave = latestBean.roast[i];        // Save the value to bump forward
        latestBean.roast[i] = tempReadyToInsert;      // Overwrite it with the previous one
        tempReadyToInsert = tempNeedToSave;    // Set the saved one as the next insert location
      } else {
        latestBean.roast[i] = tempReadyToInsert; // Insert the last one!
      }
    }
    await this.setState({ latestBean });
  }
  async onRemoveRoast(roastIndex) {
    let latestBean = this.state.latestBean;
    let objectArraySize = Object.keys(latestBean.roast).length;
    for (var i = roastIndex; i < objectArraySize; i++) {
      latestBean.roast[i] = latestBean.roast[i+1];
    }
    delete latestBean.roast[objectArraySize-1];
    await this.setState({ latestBean });
  }

  onChangeBeanWeight(event) {
    let latestBean = this.state.latestBean;
    latestBean.beanWeightInGrams = event.target.value;
    this.setState({ latestBean });
  }

  onChangenibWeight(event) {
    let latestBean = this.state.latestBean;
    latestBean.nibWeightInGrams = event.target.value;
    this.setState({ latestBean });
  }

  validateBean() {
    var isValid = true;

    if (this.state.selected.length > 1) {
      alert('too many beans selected');
      isValid = false;
    } else if (this.state.selected.length === 0) {
      alert('no beans selected');
      isValid = false;
    }

    if (isValid && (this.state.latestBean.nibWeightInGrams === "")) {
      alert('no nib weight');
      isValid = false;
    } else if (isValid && isNaN(this.state.latestBean.nibWeightInGrams)) {
      alert('invalid weight');
      isValid = false;
    }

    return isValid;
  }

  // Verify all fields and package / add a Bean to the state
  async addBean(event) {
    if (!this.validateBean()) {
      return;
    }

    this.state.latestBean['pricePerKilogram'] = this.state.selected[0]['pricePerKilogram'];
    this.state.latestBean['beanId'] = this.state.selected[0]['value'];
    this.props.onAddBean(this.state.latestBean);

    // Reset Form
    this.setSelected([]);
    var latestBean = CONSTS.BEAN_DEFAULT;
    await this.setState({latestBean});

  }


  render() {
    const isInvalid = false;// this.state.latestBean.weight !== '' ? true : false;
    var roastTimeTemp = this.renderRoastTimeTemps();
    var finalTemp = this.renderFinalTemp();

    return (
      <div key="id1" className="module small">
        <b>Bean</b>
        <MultiSelect
          options={this.state.beanOptions}
          value={this.state.selected}
          onChange={this.setSelected}
          labelledBy="Select"
          hasSelectAll={false}
        />
        <br />
        <br />
          <label htmlFor="beanWeightInGrams">Bean Weight (grams):</label>
          <input
           size="7"
           name="beanWeightInGrams"
           value={this.state.latestBean.beanWeightInGrams}
           onChange={this.onChangeBeanWeight}
           type="text"
           placeholder=""
         />
         <br />
          <label htmlFor="nibWeightInGrams">Nib Weight (grams):</label>
          <input
           size="7"
           name="nibWeightInGrams"
           value={this.state.latestBean.nibWeightInGrams}
           onChange={this.onChangenibWeight}
           type="text"
           placeholder=""
         />
         <br />
         <br />
         Roast Oven:
         {roastTimeTemp}
         <br />
         Bean Final Temp Range:
         {finalTemp}
         <br/>
          <button disabled={isInvalid} onClick={this.addBean}>Add Bean</button>
      </div>
    );
  }
}

export default withFirebase(BeanPreparation);
