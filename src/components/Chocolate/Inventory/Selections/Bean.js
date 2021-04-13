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
      console.log('rednering single roasts', roast);
    if (!roast || roast.length == 0) {
        roastTimeTemp = <RoastSelection key="0" input={[0,76]} index="0" name="beans" onChangeRoast={this.onChangeRoast} onAddRoast={this.onAddRoast} onRemoveRoast={this.onRemoveRoast} />;
    } else {
      console.log('rednering double roasts', roast);
      for (var i = 0; i < roast.length; i++) {
          roastTimeTemp =  <RoastSelection
            key={i}
            input={roast[i]}
            index={i}
            name="beans"
            roastIndex={i}
            onChangeRoast={this.onChangeRoast}
            onAddRoast={this.onAddRoast}
            onRemoveRoast={this.onRemoveRoast}
          />;
      }
    }
    return roastTimeTemp;
  }
  onChangeRoast(roastIndex, roastData) {
  //  this.setState({beans});
    console.log('roastIndex: '+  roastIndex + ' roastData: ' + roastData[0] + " " + roastData[1]);

    let latestBean = this.state.latestBean;
    latestBean.roast[roastIndex] = roastData;
    console.log('laestBean' ,latestBean.roast[roastIndex]);
    this.setState({ latestBean });
  }
  onAddRoast(roastIndex) {
  //  this.setState({beans});
    console.log('addRoastAtIndex '+ roastIndex);
  }
  onRemoveRoast(roastIndex) {
    //this.setState({beans});
    console.log('remove roast at index ' +  roastIndex);
  }


  // Verify all fields and package / add a Bean to the state
  addBean(event) {
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
    const roastTimeTemp = this.renderRoastTimeTemp();
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
         {roastTimeTemp}
         <br/>
          <button disabled={isInvalid} type="submit">Add Bean</button>
        </form>
      </div>
    );
  }
}

export default withFirebase(BeanSelection);
