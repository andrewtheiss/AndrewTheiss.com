import React from 'react';



const BeanPreparationSummarySingle = ({bean, value, remove, beanDetails}) => (
  <div key={"Bean" + value}>
    <button key={value + value} onClick={remove} value={value}>X</button> {bean}  Weight: {beanDetails.weightInGrams} grams
      <div>Final Temps...  High:{beanDetails.finalTemp.high}  Low:{beanDetails.finalTemp.low} Average:{beanDetails.finalTemp.average}</div>
      <div>Roast has <b>{Object.keys(beanDetails.roast).length}</b> number of roast measurements</div>
  </div>
)


class BeanPreparationSummary extends React.Component {
  constructor(props) {
    super(props);
    console.log('beanSummary',props);
    this.removeBean = this.removeBean.bind(this);
  }
  removeBean(beanId) {
    this.props.onRemoveBean(beanId.target.value);
  }
  render() {

    const beansToView = Object.keys(this.props.input).map((key, index) => (
         <BeanPreparationSummarySingle key={index} bean={this.props.input[key].beanId} beanDetails={this.props.input[key]} remove={this.removeBean} value={key}/>
    ));
    return (
      <div key="beanValue">
        {beansToView}
      </div>
    );
  }
}

export default BeanPreparationSummary;
