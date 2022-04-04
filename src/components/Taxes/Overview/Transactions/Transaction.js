import React from 'react';
import { ethers } from "ethers";

class Transaction extends React.Component {
  constructor(props) {
    super(props);

    this.setState({
      index : '', // Same as block number?
      blockNumber : '',
      order : '', // Probably not used but there could be 2 transactions in the same block...
      txnHash : '',
      timestamp : '',
      gasCost : 0, // This doubles as determining if it's to/from
      contractInteraction : '',

      // Heavy lifting here, but get other parts to work first
      input : '',
      processedInput : {}
    });
  }

  // Get data from DB in this function
  async componentDidMount(){
    // Grab the transaction with this index from the master list
  }

  async grabTxnFromDb() {
    const transaction = this.props.firebase.db.collection("transactions");
    let self = this;
    txnCollectionRef.where("txnHash", "==", txn).get().then(function(transactionCollectionDocs) {
      var transactionMap = {};
      transactionCollectionDocs.forEach(function(doc) {
        transactionMap[doc.id] = doc.data();
      });

      self.setState({
        transaction : transactionMap
      });
    });

  }

  processTransaction(txnId) {
    // Grab from the DB and see if it's there
    // If Not // (NOW) we should grab the transaction from the

    //
    // transactionListAsc.json file and grab it by index
    //
  }

  render() {
    return (
      <div className="transactionDetails">
        <div>Currencies this transaction touches</div>
         <div>Txn: {this.state.transaction.txnHash}</div>
         <div>Txn Block Number: {this.state.transaction.blockNumber}</div>
         <div>Txn Time: {this.state.transaction.timestamp}</div>
         <div></div>
      </div>
    );
  }
}

export default Transaction;
