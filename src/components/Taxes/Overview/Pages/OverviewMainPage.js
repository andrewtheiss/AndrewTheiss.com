import React from 'react';
import { FirebaseContext } from '../../../Firebase';
import { ethers } from "ethers";
import Transaction from '../Transactions/Transaction.js'

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
    var latestTransction = this.getLatestProcessedTransaction();

    var transactionList = this.grabTransactionList(eth.provider);
    this.setState({eth});
  }

  //
  async getLatestProcessedTransaction() {

    /*
    const collectionRef = this.props.firebase.db.collection("moldSize");
    let self = this;
    await collectionRef.get().then(function(collectionDocs) {
      var moldData = {};
      collectionDocs.forEach(function(doc) {
        moldData[doc.id] = doc.data();
      });

      self.moldData = moldData;
    });

    */
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

    // Figure out how many transactions we already processed and grab that many
    // transactions + a couple more to process
    // NEED TO GET TRANSACTION BY HASH
    let TEMP_totalTransactionsProcessed = 830; // Ox2ae8d7ae8e7f7a8d78f7889098709ad
    // Find number of transactions processed after that one

    // How many extra transactions we want to grab since the one which was processed
    let transactionCountBuffer = 5;

    let transactionCountToGrab = transactionDetails.count - TEMP_totalTransactionsProcessed;
    transactionCountToGrab += transactionCountBuffer;

    const response = await fetch('https://api.etherscan.io/api?module=account' +
         '&action=txlist' +
         '&address=' + transactionDetails.wallet +
         '&startblock=0' +
         '&endblock=99999999' +
         '&page=1' +
         '&offset=' + transactionCountToGrab +
         '&sort=desc' +
         '&apikey=' + this.etherscanApi
       );
    const json = await response.json();
    transactionDetails.json = json;
    this.setState({
      transactionsToProcess: json,
      totalTransactions :transactionDetails.json
    });


  }

  render() {
    return (
      <div className="scripts-page">
      <h1>Transactions</h1>

      <div key="1" className="txn-container">
        <FirebaseContext.Consumer>
          {firebase => <Transaction firebase={firebase} txnHash={this.txnHash} utils={this.state.eth}/>}
        </FirebaseContext.Consumer>
      </div>
      </div>
    );
  }
}

export default TaxesOverviewMainPage;
