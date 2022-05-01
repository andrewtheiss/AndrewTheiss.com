import React from 'react';
import { FirebaseContext } from '../../../Firebase';
import TastingSideBySide from './SideBySide.js'
import TastingGeographic from './Geographic.js'
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
        if (this.props.tasting) {
          latestTastingState = this.props.tasting;
          this.setState({latestTastingState});
        } else if (this.props.tastingId) {
          
          let tastingId = this.props.tastingId;
          this.setState({tastingId});
        }
          
      }
    }

  // Render Preview by type (side-by-side, geography, ..survey?)
  render() {
    console.log(this.state.latestTastingState);
    if (this.state.latestTastingState && (this.state.latestTastingState.comparison === 'Geographic')) {
      return (
        <div>
        Geographic Preview
        
        <FirebaseContext.Consumer>
            {firebase =>
              <TastingGeographic
                firebase={firebase}
                tasting={this.state.latestTastingState}
                tastingId={this.state.tastingId}
              />
            }
        </FirebaseContext.Consumer>
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
              tastingId={this.state.tastingId}
            />
          }
      </FirebaseContext.Consumer>
      </div>
    );
  }
}

export default TastingPreview;
