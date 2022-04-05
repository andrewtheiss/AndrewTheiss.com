import React from 'react';
import { ethers } from "ethers";
import * as CONSTS from './Consts.js'

class TransactionProcessor extends React.Component {
  constructor(props) {
    super(props);
    this.processTransaction = this.processTransaction.bind(this);
    this.calcTxnCost = this.calcTxnCost.bind(this);
    console.log(props);
  }

  processTransaction() {

    let price = this.calcTxnCost();


    this.state = {
      index : '', // Same as block number?
      blockNumber : this.props.blockNumber,
      order : '', // Probably not used but there could be 2 transactions in the same block...
      txnHash : '',
      timestamp : '',
      gasCost : price, // This doubles as determining if it's to/from
      contractInteraction : '',

      // Heavy lifting here, but get other parts to work first
      input : '',
      processedInput : {},
      processed : false
    };

    console.log(this.state);
    return this.state;
  }

  calcTxnCost() {
    let txnCost = 0;

    for (var i = 0; i < CONSTS.OWNED_ACCOUNTS_LIST.length; i++) {
      if (CONSTS.OWNED_ACCOUNTS_LIST[i] == this.props.from) {
        // Non-zero cost
        txnCost = this.props.effectiveGasPrice._hex;
      }
    }

    if (txnCost != 0) {
      alert('txn cost' + txnCost);
    }
    // We need to have a list of all txns where the sender is one of our addresses
    return txnCost;
  }
}

export default TransactionProcessor;
