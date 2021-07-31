import React from 'react';
import './Batch.css'

const DEFAULT_SPLIT_STATE = {
  values : undefined,
  newLabel : '',
  additionalNotes : '',
  gramWeightOfNewBatch : 0
};

class SplitChocolateBatch extends React.Component {
  constructor(props) {
    super(props);
    this.generateProposedSplitLabel = this.generateProposedSplitLabel.bind(this);
    this.splitBatch = this.splitBatch.bind(this);
    this.updateInput = this.updateInput.bind(this);
    this.validateSplitBatch = this.validateSplitBatch.bind(this);
    this.adjustBatchByPct = this.adjustBatchByPct.bind(this);
    this.adjustDetails = this.adjustDetails.bind(this);
    this.adjustNonBeanIngredients = this.adjustNonBeanIngredients.bind(this);
    this.adjustBeanIngredients = this.adjustBeanIngredients.bind(this);

    let state = DEFAULT_SPLIT_STATE;
    state.values = this.props.batch;
    this.state = state;
    this.nextLastLetter = undefined;
  }

  // Edit is flagged only whe BatchLookup sends an ID, otherwise, upstream 'isEdit' variables remain false
  componentDidUpdate(prevProps) {
    if (this.props.batch !== prevProps.batch) {
      let isEdit = (this.props.batch === undefined || this.props.batch === false) ? false : true;
      let state = DEFAULT_SPLIT_STATE;
      let values = false;

      if (isEdit && this.props.batch !== undefined) {
        if (this.props.batch.values !== undefined) {
          values = this.props.batch.values;
          if (values.Details && values.Details.label) {
            state.newLabel = this.generateProposedSplitLabel(this.props.batch.values.Details.label);
          } else {
            state.newLabel = this.generateProposedSplitLabel();
          }
        }
      }
      state.values = values;
      this.setState(state);
    }
  }

  generateProposedSplitLabel(currentBatchLabel) {
    if (!currentBatchLabel || currentBatchLabel.length === undefined) {
      return 'DNE-2021-00A';  // Does Not Exist
    } else if (currentBatchLabel.length === 0) {
      return 'DNE-2021-00A';
    }
    let currentBatchExceptLast = currentBatchLabel.substring(0,currentBatchLabel.length-1);
    this.nextLastLetter = String.fromCharCode(currentBatchLabel.charCodeAt(currentBatchLabel.length - 1) + 1);
    let label = currentBatchExceptLast + this.nextLastLetter;
    this.checkLabelIsValid(label);
    return label;
  }

  async updateInput(event) {
    await this.setState({[event.target.name]:event.target.value});
  }

  async checkLabelIsValid(label) {
    let self = this;
    return true;
  }

  validateSplitBatch() {
    let valid = true;
    let invalidText = "";
    if (this.state.gramWeightOfNewBatch <= 0) {
      invalidText += "Size of batch must be > 0";
      valid = false;
    }

    // TODO make sure the gram weight is < batch Size

    return valid;
  }

  adjustDetails(batch, pct) {

  }

  adjustNonBeanIngredients(batch, pct) {

  }

  adjustBeanIngredients(batch, pct) {

  }

  adjustBatchByPct(batch, pct) {
    batch = this.adjustDetails(batch, pct);
    batch = this.adjustNonBeanIngredients(batch, pct);
    batch = this.adjustBeanIngredients(batch, pct);
    return batch;
  }

  splitBatch() {
    if (this.validateSplitBatch()) {
      console.log(this.state.values.Details.label);
      let oldBatch = JSON.parse(JSON.stringify(this.state.values));
      let newBatch = JSON.parse(JSON.stringify(this.state.values));

      let oldBatchPct = (oldBatch.Details.batchTotalWeightInGrams - this.state.gramWeightOfNewBatch) / oldBatch.Details.batchTotalWeightInGrams;
      let newBatchPct = 1.0 - oldBatchPct;

      this.adjustBatchByPct(oldBatch, oldBatchPct);
      this.adjustBatchByPct(newBatch, newBatchPct);
      console.log(this.state.gramWeightOfNewBatch, oldBatch, newBatch, newBatchPct, oldBatchPct);
    }
  }

  render() {
    if (this.state == null || this.state.values === undefined || this.state.values === false) {
      return <div></div>;
    }

    let selectedBatchSizeGrams = 0;
    let batchId = '';
    if (this.state.values.Details && this.state.values.Details.nutritionFacts && this.state.values.Details.nutritionFacts.servingSizeInGrams) {
      selectedBatchSizeGrams = Number(this.state.values.Details.nutritionFacts.servingSizeInGrams);
      batchId = this.state.values.Details.label;
    }

    return (
      <div className="splitBatchContainer">
      Split Batch
        <div className="splitBatchLabel">Batch ID: <b>{batchId}</b></div>
        <div>Current Batch Size: {selectedBatchSizeGrams}</div>
        Split Off Size (grams):
        <input
          size="10"
          name="gramWeightOfNewBatch"
          className="splitBatchWeightInGrams"
          value={this.state.gramWeightOfNewBatch}
          onChange={this.updateInput}
          type="text">
        </input>
        <div className="splitBatchNewLabel">New Label:
          <input
            type="text"
            size="20"
            className="splitBatchNewLabel"
            onChange={this.updateInput}
            name="newLabel"
            value={this.state.newLabel}>
          </input>
        </div>
        <button onClick={this.splitBatch}>Split Batch</button>
      </div>

    )
  };
};

export default SplitChocolateBatch;
