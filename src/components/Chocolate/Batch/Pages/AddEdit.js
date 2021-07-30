import React from 'react';
import { FirebaseContext } from '../../../Firebase';
import CreateNewChocolateBatch from '../CreateNew.js'
import LookupChocolateBatch from '../Lookup.js'
import * as CONSTS from '../constants.js'

/*
 *  Routing routes all Components with Route 'props' this taket
 */
class AddEditChocolateBatchPage extends React.Component {
  constructor(props) {
    super(props);
    this.onSelectBatch = this.onSelectBatch.bind(this);
    this.state = {
      selectedBatch : undefined
    };
  }

  async onSelectBatch(selectionId) {
    let selectedBatch = selectionId;
    if (selectionId === undefined || selectionId === '') {
      selectedBatch = {values : CONSTS.CHOCOLATE_BATCH_DEFAULTS};
    }
    await this.setState({selectedBatch});
  }

  render() {
    return (
      <div>
      <FirebaseContext.Consumer>
          {firebase => <LookupChocolateBatch firebase={firebase} onSelectBatch={this.onSelectBatch}/>}
      </FirebaseContext.Consumer>
        <FirebaseContext.Consumer value={this.state.selectedBatch}>
            {firebase => <CreateNewChocolateBatch firebase={firebase} batchToEdit={this.state.selectedBatch}/>}
        </FirebaseContext.Consumer>
      </div>
    )
  };
};

export default AddEditChocolateBatchPage;
