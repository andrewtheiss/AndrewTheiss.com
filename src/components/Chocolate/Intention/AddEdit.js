import React from 'react';
import ImageUpload from '../../Utils/ImageUpload.js'
import * as CONSTS from './constants.js'
/**
 *  AddEditMoldSize
 *
 */
class AddEditIntention extends React.Component {
  constructor(props) {
    super(props);
    this.setIntention = this.setIntention.bind(this);
    this.onUpdateDetails = this.onUpdateDetails.bind(this);

    this.state = CONSTS.INTENTION_DEFAULT_PROPS;
  }

  // Somewhere save this.props.batchToEdit.Details.label as this.batchToEditLabel
  componentDidUpdate(prevProps) {
    let isEdit = this.props.itemSelectedForEdit;

    // Only do something if there's a change in the batchToEdit
    if (this.props !== prevProps) {

      // If there's something to edit or the props don't match the default
      if (isEdit) {

        // Save the selected label we selected for edit
        if (this.props.itemSelectedForEdit) {
          this.setState(this.props.itemSelectedForEdit);
        }
      } else {
        this.setState(CONSTS.INTENTION_DEFAULT_PROPS);
      }
    }
  }

  async onUpdateDetails(event) {
    var state = this.state;
    state[event.target.name] = event.target.value;
    await this.setState(state);
  }

  async setIntention() {

    let documentToEdit = this.state.label;
    const publicCollectionRef = this.props.firebase.db.collection("intentionPublic");
    await publicCollectionRef.doc(documentToEdit).set(this.state).then(() => {
      console.log('set public intention');
    });
    const collectionRef = this.props.firebase.db.collection("intention");
    await collectionRef.doc(documentToEdit).set(this.state).then(() => {
      console.log('set intention');
    });

    let state = CONSTS.INTENTION_DEFAULT_PROPS;
    this.setState(state);
  }

  render() {
    return (
      <div>
      Intention Label:  <input name="label"  onChange={this.onUpdateDetails} value={this.state.label} size="30" type="text"></input><br />
      Notes: <textarea name="notes"  onChange={this.onUpdateDetails} value={this.state.notes} type="text"></textarea><br />
      <button onClick={this.setIntention}>Update Intention</button>
      </div>
    );
  }
}

export default AddEditIntention;
