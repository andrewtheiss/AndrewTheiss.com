import React from 'react';
import { FirebaseContext } from '../../../Firebase';
import TastingSideBySide from './SideBySide.js'
/**
 *  TastingPreview
 *
 *  Input:
 *  bars      : array of bars with all data
 *  tastingId : optional we can give it a tasting ID and it can handle all dependencies
 *
 */
class TastingPreview extends React.Component {
  constructor(props) {
    super(props);
    console.log(props);
    this.state = {
      latestTastingState : {}
    }
  }

    async componentDidUpdate(prevProps) {
      if (this.props !== prevProps) {
        let latestTastingState = {};
        latestTastingState = this.props.tasting;
        this.setState({latestTastingState});
      }
    }

  // Render Preview by type (side-by-side, geography, ..survey?)
  render() {
    if (this.state.latestTastingState.comparison === 'Geographic') {
      return (
        <div>
        Geographic Preview
        </div>
      )
    }
    return (
      <div>
      <FirebaseContext.Consumer>
          {firebase =>
            <TastingSideBySide
              firebase={firebase}
              tasting={this.state.latestTastingState}
            />
          }
      </FirebaseContext.Consumer>
      </div>
    );
  }
}

export default TastingPreview;
