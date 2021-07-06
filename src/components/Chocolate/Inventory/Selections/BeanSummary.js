import React from 'react';



const BeanSummarySingle = ({bean, value, remove, beanDetails}) => (
  <div key={"Bean" + value}>
    <button key={value + value} onClick={remove} value={value}>X</button> {bean}  Kg: {value}
      <div>Final Temps...  High:{beanDetails.finalTemp.high}  Low:{beanDetails.finalTemp.low} Average:{beanDetails.finalTemp.average}</div>
      <div>Roast has <b>{beanDetails.roast.length}</b> number of roast measurements</div>
  </div>
)


class BeanSummary extends React.Component {
  constructor(props) {
    super(props);
    this.removeBean = this.removeBean.bind(this);
  }
  removeBean(beanId) {
    this.props.onRemoveBean(beanId.target.value);
  }
  render() {

    const beansToView = Object.keys(this.props.input).map((key, index) => (
         <BeanSummarySingle key={index} bean={this.props.input[key].beanId} beanDetails={this.props.input[key]} remove={this.removeBean} value={key}/>
    ));
    return (
      <div key="beanValue">
        {beansToView}
      </div>
    );
  }
}

export default BeanSummary;
