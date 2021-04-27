import React from 'react';
import { withFirebase } from '../../../Firebase';
import RoastSelection from './Roast.js'
import * as CONSTS from '../constants.js'


const BeanOption = ({name, value}) => (
  <option key={value} val={value}>
    {value} : {name}
  </option>
)

const SelectedBean = () => {
  <div>

  </div>
}

// Create default bean params
// weight, beanID,

class BeanSelection extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      options : '',
      beans : [],
      latestBean : CONSTS.BEAN_DEFAULT
    };
    this.renderOptions = this.renderOptions.bind(this);
    this.componentDidMount = this.componentDidMount.bind(this);
    this.addBean = this.addBean.bind(this);
    this.onChangeBeanWeight = this.onChangeBeanWeight.bind(this);
    this.renderRoastTimeTemp = this.renderRoastTimeTemp.bind(this);
    this.onChangeRoast = this.onChangeRoast.bind(this);
    this.onAddRoast = this.onAddRoast.bind(this);
    this.onRemoveRoast = this.onRemoveRoast.bind(this);
  }
  componentDidMount() {
    const beansCollectionRef = this.props.firebase.db.collection("beans");
    let self = this;
    beansCollectionRef.get().then(function(beanCollectionDocs) {
      var beansMap = {};
      beanCollectionDocs.forEach(function(doc) {
        beansMap[doc.id] = doc.data();
        //console.log(doc.data());
      });

      self.setState({
        beans : beansMap
      });
    });
  }
  renderOptions() {
    let beanOptions = '';
    if (!this.state.beans || this.state.beans.length == 0) {
        beanOptions = <BeanOption key="noBeanSelection" value="noSelection" name={"None"} />;
    } else {
        beanOptions = Object.keys(this.state.beans).map((key) => (
          <BeanOption key={key} name={this.state.beans[key].name} value={key}/>
        ));
    }
    return beanOptions;
  }

  renderRoastTimeTemp() {
    let roastTimeTemp = '';
    let roast = this.state.latestBean.roast;
    var self = this;
    if (!roast || roast.length == 0) {
        roastTimeTemp = <RoastSelection key="0" input={CONSTS.ROAST_INITIAL} index="0" name="beans" onChangeRoast={this.onChangeRoast} onAddRoast={this.onAddRoast} onRemoveRoast={this.onRemoveRoast} />;
    } else {
    // Creating a unique key forces re-render ONLY each time length is changed
      var rand = roast.length/3.14159;
      roastTimeTemp = roast.map((roastTime, index) =>
          <RoastSelection
           key={index + rand}
           input={roastTime}
           index={index}
           name="beans"
           roastIndex={index}
           onChangeRoast={self.onChangeRoast}
           onAddRoast={self.onAddRoast}
           onRemoveRoast={self.onRemoveRoast}
         />
      );
    }
    return roastTimeTemp;
  }
  async onChangeRoast(roastIndex, roastData) {
    let latestBean = this.state.latestBean;
    latestBean.roast[roastIndex] = roastData;
    await this.setState({ latestBean });
  }

  async onAddRoast(roastIndex) {
    let latestBean = this.state.latestBean;
    latestBean.roast.splice(roastIndex+1, 0, CONSTS.ROAST_EMPTY);
    await this.setState({ latestBean });
  }
  async onRemoveRoast(roastIndex) {
    let latestBean = this.state.latestBean;
    latestBean.roast.splice(roastIndex, 1);
    await this.setState({ latestBean });
  }


  // Verify all fields and package / add a Bean to the state
  addBean(event) {

    // TODO - Calculate Roast Times



    console.log(event);
    this.props.onChangeBean('new bean values');
    var addedBean = CONSTS.BEAN_DEFAULT;
    event.preventDefault();
  }

  onChangeBeanWeight(event) {
    let latestBean = this.state.latestBean;
    latestBean.weight = event.target.value;
    this.setState({ latestBean });
  }


  render() {
    const isInvalid = false;// this.state.latestBean.weight !== '' ? true : false;
    const selection = <select key="selectBean">{this.renderOptions()}</select>;
    var roastTimeTemp = this.renderRoastTimeTemp();
    //const addedBeans =

    return (
      <div key="id1">
        Bean Selection
        {selection}
        <form onSubmit={this.addBean}>
          <label htmlFor="weight">Weight (kg):</label>
          <input
           name="wight"
           value={this.state.latestBean.weight}
           onChange={this.onChangeBeanWeight}
           type="text"
           placeholder=""
         />
         <br />
         Roast:
         {roastTimeTemp}
         <br/>
          <button disabled={isInvalid} type="submit">Add Bean</button>
        </form>
      </div>
    );
  }
}

export default withFirebase(BeanSelection);
