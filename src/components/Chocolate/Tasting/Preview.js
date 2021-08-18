import React from 'react';

/**
 *  TastingPreview
 *
 *  Input:
 *  state   :   tasting state object
 *
 */
class TastingPreview extends React.Component {
  render() {
    if (!this.props.state) {
      return (<div></div>);
    }
    return (
      <div>
        Tasting is: {JSON.stringify(this.props)}
        <div>
          Tasting Content!
        </div>
      </div>
    );
  }
}

export default TastingPreview;
