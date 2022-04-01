import React from 'react';
import { ethers } from "ethers";

class TaxesOverviewMainPage extends React.Component {
  constructor(props) {
    super(props);
    this.defaultWallet = 'theiss.eth';

    this.grabTransactionList = this.grabTransactionList.bind(this);

    this.state = {
      transactionList : [],
      transactionReceiptList : [],
      eth : {}
    };

  }

  // Get data from DB in this function
  componentDidMount = () => {
    /*const beanCollectionRef = this.props.firebase.db.collection("beans");
    let self = this;
    beanCollectionRef.get().then(function(beanCollectionDocs) {
      var beansMap = {};
      beanCollectionDocs.forEach(function(doc) {
        beansMap[doc.id] = doc.data();
      });

      self.setState({
        beans : beansMap
      });
    });*/

    let eth = {
      network : "mainnet",
      provider : null,
      ethers : null
    };

    // API specific key
    eth.provider = ethers.getDefaultProvider(eth.network, {
        etherscan: 'NCTXRETEMIUZU5FJTDZHHV43DE99699FDP'
    });

    //ethers.provider = new ethers.providers.Web3Provider(window.ethereum);
    eth.ethers = ethers;
    this.setState({eth});
    //this.grabTransactionList(null);
  }


  grabTransactionList(grabTransactionList) {

    let transactionDetails = {
      count : null
    };
    // How many transactions do we have?
    transactionDetails.count = this.state.eth.provider.getTransactions(this.defaultWallet);
    console.log('found ' + transactionDetails.count);

    // Grab transactions from database and check

  }

  render() {
    return (
      <div className="scripts-page">
      <h1>Transactions</h1>
      <button onClick={this.runSafetyNetLogin} id="safetyLogin">Safety Net Login</button>
      {this.state.sent ?  <div>Sent!</div> : ''}
      </div>
    );
  }
}

export default TaxesOverviewMainPage;
