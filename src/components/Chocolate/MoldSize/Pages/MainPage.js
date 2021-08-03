import React from 'react';
import { FirebaseContext } from '../../../Firebase';
import AddEditMoldSize from '../AddEdit.js'
import LookupSelection from '../../../Utils/LookupSelection.js'
import '../MoldSize.css'


class MoldSizeMainPage extends React.Component {

  constructor(props) {
    super(props);
    this.onUpdateSelection = this.onUpdateSelection.bind(this);

    this.state = {
      selectedMoldSize : null
    }
  }

  onUpdateSelection(selectedMoldSizeId) {
    let selectedMoldSize = selectedMoldSizeId;
    this.setState({selectedMoldSize});
  }

  render() {
    console.log('bar lookup page');
    return (
      <div className="moldSizeMainPageContainer">

        <FirebaseContext.Consumer>
          {firebase =>
            <AddEditMoldSize
              firebase={firebase}
              itemSelectedForEdit={this.state.selectedMoldSize}
            />
          }
        </FirebaseContext.Consumer>
        <FirebaseContext.Consumer>
          {firebase =>
              <LookupSelection
                firebase={firebase}
                onUpdateSelection={this.onUpdateSelection}
                collectionName="moldSize"
                displayTitle="Bar Mold / Sizes"
              />
            }
        </FirebaseContext.Consumer>
      </div>
    );
  }
}

export default MoldSizeMainPage;
