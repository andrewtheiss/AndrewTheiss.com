import React from 'react';

/**
 *  Preview Mold Sizes
 */
class PreviewIntention extends React.Component {
  render() {
    return (
      <div>- <span>{this.props.intention}</span>
      </div>
    );
  }
}

class PreviewIntentions extends React.Component {
  constructor(props) {
    super(props);
    this.generatePreviewIntentionList = this.generatePreviewIntentionList.bind(this);
  }


  generatePreviewIntentionList() {
    let preview = '';

    if (this.props.intentions && this.props.intentions.length > 0) {
      preview = Object.keys(this.props.intentions).map((key) => (
        <PreviewIntention intention={this.props.intentions[key]} key={key} />
      ));
    }
    return preview;
  }

  render() {
    if (!this.props.mold) {
      return (<div></div>);
    }
    let intentionList = this.generatePreviewIntentionList();

    return (
      <div>
        Intentions for this bar are: {JSON.stringify(this.props)}
        <div>
          {intentionList}
        </div>
      </div>
    );
  }
}

export default PreviewIntentions;
