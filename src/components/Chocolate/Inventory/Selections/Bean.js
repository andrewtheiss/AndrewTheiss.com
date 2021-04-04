import React from 'react';
import { withFirebase } from '../../../Firebase';
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

    this.renderOptions = this.renderOptions.bind(this);
    this.componentDidMount = this.componentDidMount.bind(this);
    this.addBean = this.addBean.bind(this);
    this.onChangeBeanWeight = this.onChangeBeanWeight.bind(this);

    this.state = {
      options : '',
      beans : [],
      latestBean : CONSTS.BEAN_DEFAULT
    };

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
    console.log(this.state);
    console.log("Constants" , CONSTS);
    const isInvalid = false;// this.state.latestBean.weight !== '' ? true : false;
    const selection = <select key="selectBean">{this.renderOptions()}</select>;
    //const addedBeans =

    return (
      <div key="id1">
        Bean Selection
        {selection}
        <form onSubmit={this.addBean}>
          <label for="weight">Weight (kg):</label>
          <input
           name="wight"
           value={this.state.latestBean.weight}
           onChange={this.onChangeBeanWeight}
           type="text"
           placeholder=""
         />
         <br/>
          <button disabled={isInvalid} type="submit">Add Bean</button>
        </form>
      </div>
    );
  }
}

export default withFirebase(BeanSelection);
