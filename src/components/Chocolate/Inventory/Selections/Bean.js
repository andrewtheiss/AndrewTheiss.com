import React from 'react';
import { withFirebase } from '../../../Firebase';


const BeanOption = ({name, value}) => (
  <option key={value} val={value}>
    {value} : {name}
  </option>
)

class BeanSelection extends React.Component {
  constructor(props) {
    super(props);

    this.renderOptions = this.renderOptions.bind(this);
    this.componentDidMount = this.componentDidMount.bind(this);
    this.addBean = this.addBean.bind(this);

    this.state = {
      options : '',
      beans : []
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
  addBean() {
    this.props.onChangeBean('new bean values');
  }
  render() {
    const selection = <select key="selectBean">{this.renderOptions()}</select>;
    return (
      <div key="id1">
        Bean Selection
        {selection}
        <button key="id2" onClick={this.addBean}>Add Bean</button>
      </div>
    );
  }
}

export default withFirebase(BeanSelection);
