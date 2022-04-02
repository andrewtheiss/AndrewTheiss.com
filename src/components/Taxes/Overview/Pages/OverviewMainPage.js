import React from 'react';
import { ethers } from "ethers";

class TaxesOverviewMainPage extends React.Component {
  constructor(props) {
    super(props);
    this.defaultWallet = 'theiss.eth';
    this.etherscanApi = 'NCTXRETEMIUZU5FJTDZHHV43DE99699FDP';
    this.grabTransactionList = this.grabTransactionList.bind(this);

    this.state = {
      transactionList : [],
      transactionReceiptList : [],
      eth : {}
    };

  }

  // Get data from DB in this function
  async componentDidMount() {
    let eth = {
      network : "mainnet",
      provider : null,
      ethers : null
    };

    // API specific key
    eth.provider = await ethers.getDefaultProvider(eth.network, {
        etherscan: this.etherscanApi
    });

    //ethers.provider = new ethers.providers.Web3Provider(window.ethereum);
    eth.ethers = ethers;
    var transactionList = this.grabTransactionList(eth.provider);
    this.setState({eth});
  }


  async grabTransactionList(provider) {

    let transactionDetails = {
      count : null
    };
    // How many transactions do we have?
    //https://etherscan.io/exportData?type=address&a=0x3afb0b4ca9ab60165e207cb14067b07a04114413
    transactionDetails.wallet = await provider.resolveName(this.defaultWallet);
    transactionDetails.count = await provider.getTransactionCount(this.defaultWallet);
    console.log('found ' + transactionDetails.count);

    const response = await fetch(`https://api.etherscan.io/api?module=account
         &action=txlist
         &address=` + transactionDetails.wallet + `
         &startblock=0
         &endblock=99999999
         &page=1
         &offset=10
         &sort=asc
         &apikey=` + this.etherscanApi
       );
    const json = await response.json();
    console.log(json);
    this.setState({ data: json });
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
