import React from 'react';

class BeanDetails extends React.Component {

  render() {
    const pricePerLb = Math.round(100 * this.props.bean['price'] /this.props.bean['purchaseLbs'] )/100;
    if (!this.props.bean || !this.props.bean['name']) {
      return(<div></div>);
    }
    return (
      <div className="beanDetails container">
        <div className="beanDetailsName">
          {this.props.bean['name']}
        </div>
        <div className="beanDetailsCost">
          <b>Price per lb: ${pricePerLb}</b>
          <br/><b>Purchased: {this.props.bean['purchaseLbs']} lbs</b>
        </div>
        <div className="beanDetailsNotes">
          Notes: {this.props.bean['notes']}
        </div>

image
      </div>
    );
  }
}

export default BeanDetails;
