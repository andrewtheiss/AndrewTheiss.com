import React from 'react';
import { ethers } from "ethers";
import TransactionProcessor from './Processor.js'

class Transaction extends React.Component {
  constructor(props) {
    super(props);

    this.processTransaction = this.processTransaction.bind(this);
    this.grabTxnFromDb = this.grabTxnFromDb.bind(this);
    this.etherscanApi = 'NCTXRETEMIUZU5FJTDZHHV43DE99699FDP';
    this.tempTxnHash = '0x4ee17bcd40533c68e9152db5f60b9d9d951f0a6653e813ca958003101b6371ab';


    this.state = {
      index : '', // Same as block number?
      blockNumber : '',
      order : '', // Probably not used but there could be 2 transactions in the same block...
      txnHash : '',
      timestamp : '',
      gasCost : 0, // This doubles as determining if it's to/from
      contractInteraction : '',

      // Heavy lifting here, but get other parts to work first
      input : '',
      processedInput : {},
      processed : false
    };
  }

  // Get data from DB in this function
  async componentDidMount(){
    // Grab the transaction with this index from the master list
  }

  async grabTxnFromDb(txn) {
    if (!txn) {
      return false;
    }
    const txnCollectionRef = this.props.firebase.db.collection("transactions");
    let self = this;
    txnCollectionRef.where("txnHash", "==", txn).get().then(function(transactionCollectionDocs) {
      var transactionMap = {};
      transactionCollectionDocs.forEach(function(doc) {
        transactionMap[doc.id] = doc.data();
      });

      self.setState({
        transaction : transactionMap
      });
      console.log('Txn from database =' , transactionMap);
    });
  }

  async getTxnReceiptFromChain(txnHash) {
    let txn = {};
    //
    if (0) {
      console.log('This data dump is missing the Logs for each receipt');
      txn = await this.getFromChainLocal(txnHash)
    } else {
      txn = this.getFromChainLive(txnHash);
    }
    return txn;
  }

  async getFromChainLocal(txnHash) {
    // Local file = 'transactionListAsc.json'
    let localFile = './transactionListAsc.json';
    const response = await fetch(localFile);
    let json = await response.json();

    let transactionReceipt = {};

    for (var i = 0; i < json.result.length; i++) {
      if (json.result[i] && json.result[i].hash == txnHash) {
        transactionReceipt = json.result[i];
      }
    }
    return transactionReceipt;
  }

  async getFromChainLive(txnHash) {
    const response = await this.props.utils.provider.getTransactionReceipt(txnHash);
    return response;
  }

  async processTransaction() {
    let txnHash = this.tempTxnHash;

    // Grab from the DB and see if it's there
    let processedTxn = this.grabTxnFromDb(txnHash);

    // If Not // (NOW) we should grab the transaction from the chain
    /// TODO - add override for reprocessing txn HERE
    if (!processedTxn || !processedTxn.txnId || !processedTxn.processed) {
      let txn = await this.getTxnReceiptFromChain(txnHash);

      // CALL TO processTxn here from TXN processor
      processedTxn = new TransactionProcessor(txn).processTransaction();
      console.log(processedTxn);
    }
  }

  render() {
    return (
      <div className="transactionDetails">
        <button onClick={this.processTransaction}>Process Transaction</button>
        <input type="text" placeholder={this.state.txnHash} val={this.state.txnHash}></input>

        <div>Currencies this transaction touches</div>
         <div>Txn: {this.state.txnHash}</div>
         <div>Txn Block Number: {this.state.blockNumber}</div>
         <div>Txn Time: {this.state.timestamp}</div>

         Reprocess Txn<input type="checkbox"></input>
         <div></div>
      </div>
    );
  }
}

export default Transaction;
