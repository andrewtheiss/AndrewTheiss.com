import React from 'react';
import './Batch.css'
import * as CONSTS from './constants.js'

const DEFAULT_SPLIT_STATE = {
  values : undefined,
  newLabel : '',
  additionalComments : '',
  gramWeightOfNewBatch : 0,
  key : '',
  splitAttemptError : ''
};
const DEFAULT_DOES_NOT_EXIST_LABEL = 'DNE-2021-00A';

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
    this.timedCheckLabelIsValid = this.timedCheckLabelIsValid.bind(this);
    this.generateSplitAttemptResult = this.generateSplitAttemptResult.bind(this);

    let state = DEFAULT_SPLIT_STATE;
    state.values = this.props.batch;
    this.state = state;
    this.nextLastLetter = undefined;
    this.labelExists = false;
    this.labelCheckTimeout = false;

    // Track the actual split
    this.splitCountFailed = 4;
    this.splitCountError = '';
    this.splitLabels = '';
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
            this.splitLabels = '';
            state.newLabel = this.generateProposedSplitLabel(this.props.batch.values.Details.label);
            state.additionalComments = this.generateProposedAdditionalComments(this.props.batch.values.Details.label);
          } else {
            this.splitLabels = '';
            state.newLabel = this.generateProposedSplitLabel();
            state.additionalComments = this.generateProposedAdditionalComments(DEFAULT_DOES_NOT_EXIST_LABEL);
          }
        }
      }
      state.values = values;
      this.setState(state);
    }
  }

  generateProposedAdditionalComments(currentBatchLabel) {
    return " Split original batch ID " + currentBatchLabel + " on " + new Date().toDateString() + ';';
  }

  generateProposedSplitLabel(currentBatchLabel) {
    if (!currentBatchLabel || currentBatchLabel.length === undefined) {
      return DEFAULT_DOES_NOT_EXIST_LABEL;  // Does Not Exist
    } else if (currentBatchLabel.length === 0) {
      return DEFAULT_DOES_NOT_EXIST_LABEL;
    }
    let currentBatchExceptLast = currentBatchLabel.substring(0,currentBatchLabel.length-1);
    this.nextLastLetter = String.fromCharCode(currentBatchLabel.charCodeAt(currentBatchLabel.length - 1) + 1);
    let label = currentBatchExceptLast + this.nextLastLetter;
    this.checkLabelIsValid(label, false);
    return label;
  }

  checkLabelIsValid(label, timeout) {
    let self = this;
    let valid = false;
    const latestDocRef = this.props.firebase.db.collection("batches").doc(label);
    if (!timeout) {
      latestDocRef.get().then((doc) => {
        if (doc.exists) {
          self.labelExists = true;
          valid = false;
        } else {
          // We Don't want this document to exist, because we're going to add it!
          self.labelExists = false;
          valid = true;
        }
      }).catch((error) => {
        // We Don't want this document to exist, because we're going to add it!
        self.labelExists = false;
        valid = true;
      });
    } else {
      if (this.labelCheckTimeout !== false) {
        clearTimeout(this.labelCheckTimeout);
        this.labelCheckTimeout = false;
      }
      this.labelCheckTimeout = setTimeout(function() {
        self.timedCheckLabelIsValid(label, false, self.props.firebase, self);
      }, 1000);
    }
    return valid;
  }

  async timedCheckLabelIsValid(label, timeout, firebaseContext, thisContext) {
    let self = thisContext;
    let valid = false;

    const latestDocRef = firebaseContext.db.collection("batches").doc(label);
    await latestDocRef.get().then((doc) => {
      if (doc.exists) {
        self.labelExists = true;
        valid = false;
      } else {
        // We Don't want this document to exist, because we're going to add it!
        self.labelExists = false;
        valid = true;
      }
    }).catch((error) => {
      // We Don't want this document to exist, because we're going to add it!
      self.labelExists = false;
      valid = true;
    });
    self.setState({key : Math.random()});
    return valid;
  }

  validateSplitBatch() {
    let valid = true;
    let invalidText = "";
    if (this.state.gramWeightOfNewBatch <= 0) {
      invalidText += "Size of batch must be > 0.  ";
      valid = false;
    }

    if (this.state.values && this.state.values && this.state.values.Details) {
      if (this.state.gramWeightOfNewBatch > this.state.values.Details.batchTotalWeightInGrams) {
          invalidText += "Split batch must be smaller than original size.  ";
          valid = false;
      }
    }

    if (this.labelExists) {
        invalidText += "Split label already exists.  Choose a new letter";
        valid = false;
    }

    if (!valid) {
      alert(invalidText);
    }

    return valid;
  }

  adjustDetails(batch, pct) {

    // Details first
    var detailsToAdjust = [
      'batchTotalWeightInGrams',
      'beanWeightInGrams',
      'ingredientTotalCost',
      'nibWeightInGrams'
    ];
    for (const val of detailsToAdjust) {
      batch.Details[val] = Math.round(pct * batch.Details[val] * 100) / 100;
    }

    // Nutrition Facts Next!
    Object.keys(batch.Details.nutritionFacts).forEach(key => {
      batch.Details.nutritionFacts[key] = Math.round(batch.Details.nutritionFacts[key] * pct);
    });
    batch.Details.nutritionFacts.servingsPerContainer = 1;

    Object.keys(batch.Details.batchIngredients).forEach(key => {
      batch.Details.batchIngredients[key] = Math.round(batch.Details.batchIngredients[key] * pct);
    });

    // Comments!
    batch.Details.comments += this.state.additionalComments + " This batch was " + Math.round(pct*1000)/10 + "% of original:" + this.state.values.Details.label + " (which has also been adjusted proprtionally); ";
    return batch;
  }

  adjustNonBeanIngredients(batch, pct) {
    let nonBeanCategories = CONSTS.NON_BEAN_INGREDIENT_CATEGORIES;
    for (var i = 0; i < nonBeanCategories.length; i++) {
      let keys = Object.keys(batch[nonBeanCategories[i]]);
      for (const key in keys) {
        batch[nonBeanCategories[i]][key].weight = Math.round(batch[nonBeanCategories[i]][key].weight * pct);
      }
    }
    return batch;
  }

  adjustBeanIngredients(batch, pct) {
    for (const bean in batch.Beans) {
      batch.Beans[bean].beanWeightInGrams = Math.round(batch.Beans[bean].beanWeightInGrams * pct);
      batch.Beans[bean].nibWeightInGrams = Math.round(batch.Beans[bean].nibWeightInGrams * pct);
    }
    return batch;
  }

  adjustBatchByPct(batch, pct) {
    batch = this.adjustDetails(batch, pct);
    batch = this.adjustNonBeanIngredients(batch, pct);
    batch = this.adjustBeanIngredients(batch, pct);
    return batch;
  }

  async splitBatch() {
    if (this.validateSplitBatch()) {
      let oldBatch = JSON.parse(JSON.stringify(this.state.values));
      let newBatch = JSON.parse(JSON.stringify(this.state.values));

      let oldBatchPct = (oldBatch.Details.batchTotalWeightInGrams - this.state.gramWeightOfNewBatch) / oldBatch.Details.batchTotalWeightInGrams;
      let newBatchPct = 1.0 - oldBatchPct;
      newBatch.Details.label = this.state.newLabel;

      oldBatch = this.adjustBatchByPct(oldBatch, oldBatchPct);
      newBatch = this.adjustBatchByPct(newBatch, newBatchPct);

      this.splitCountFailed = 4;
      await this.setBatch({values : oldBatch});
      await this.setBatch({values : newBatch});

      // Show the new state
      let state = this.state;
      state.splitAttemptError = false;
      if (this.splitCountFailed) {
        state.splitAttemptError = this.splitCountError;
        this.splitLabels = '';
      } else {
        state = DEFAULT_SPLIT_STATE;
        this.splitLabels = oldBatch.Details.label + " " + newBatch.Details.label;
      }
      this.setState(state);
    }
  }

  setBatch = async (batch) => {
    let documentToEdit = batch.values.Details.label;
      console.log(documentToEdit);
    var self = this;

    const publicBatchesCollectionRef = this.props.firebase.db.collection("batchesPublic");
    const result1 = await publicBatchesCollectionRef.doc(documentToEdit).set(batch.values.Details).then((val) => {
      self.splitCountFailed--;
    }).catch((error) => {
        console.error("Error splitting public batch: ", error);
    });
    const batchesCollectionRef = this.props.firebase.db.collection("batches");
    const result2 = await batchesCollectionRef.doc(documentToEdit).set(batch).then(() => {
      self.splitCountFailed--;
    }).catch((error) => {
        console.error("Error splitting private batch: ", error);
    });
    return [result1, result2];
  }

  async updateInput(event) {
    await this.setState({[event.target.name]:event.target.value});

    if (event.target.name === 'newLabel') {
      this.checkLabelIsValid(event.target.value, true);
    }
  }

  generateSplitAttemptResult() {
    if (this.state.splitAttemptError !== false) {
      return <div className="splitError"><b>{this.state.splitAttemptError}</b></div>
    }
    return <div></div>
  }

  render() {
    // Success for splitting
    if (this.splitLabels !== '') {
      return <div>Split Success!  IDs:<b>{this.splitLabels}</b></div>;
    }

    // No selected item to split
    if (this.state == null || this.state.values === undefined || this.state.values === false) {
      return <div></div>;
    }

    let selectedBatchSizeGrams = 0;
    let batchId = '';
    if (this.state.values.Details && this.state.values.Details.nutritionFacts && this.state.values.Details.nutritionFacts.servingSizeInGrams) {
      selectedBatchSizeGrams = Number(this.state.values.Details.nutritionFacts.servingSizeInGrams);
      batchId = this.state.values.Details.label;
    }

    let validNewLabelClass = (this.labelExists === false) ? "splitBatchNewLabel valid" : "splitBatchNewLabel invalid";

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
        <div className="splitBatchNewLabelContainer">New Label:
          <input
            type="text"
            size="20"
            className={validNewLabelClass}
            onChange={this.updateInput}
            name="newLabel"
            value={this.state.newLabel}>
          </input>
        </div>
        <div className="splitBatchAdditionalCommentsContainer">Additional Comments:
          <textarea
            type="text"
            rows="2"
            cols="36"
            className="splitBatchAdditionalComments"
            onChange={this.updateInput}
            name="additionalComments"
            value={this.state.additionalComments}>
          </textarea>
        </div>

        <button onClick={this.splitBatch}>Split Batch</button>
        {this.generateSplitAttemptResult()}
      </div>

    )
  };
};

export default SplitChocolateBatch;
