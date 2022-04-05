import React from 'react';
import { ethers } from "ethers";

class TransactionProcessor extends React.Component {
  constructor(props) {
    super(props);
    console.log(this, props);
  }

  processTransaction() {
    console.log('CALL TO PROCESSED TRANSASCTION');
  }
}

export default TransactionProcessor;
