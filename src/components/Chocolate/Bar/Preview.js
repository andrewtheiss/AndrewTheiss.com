import React from 'react';
import ReactDOM from "react-dom";
import { FirebaseContext } from '../../Firebase';
import './Bar.css'
import * as CONSTS from './constants.js'


class PackagingSelection extends React.Component {
  constructor(props) {
    super(props);
    this.generatePackagingImagePreview = this.generatePackagingImagePreview.bind(this);
  }

    generatePackagingImagePreview(selectionType) {
      if (!this.props.packagingSelection) {
        return <div></div>
      }

      let self = this;
      return Object.keys(this.props.packagingSelection[selectionType]).map((key) => (
        <div key={key}>
          <b>{key}</b>
          <img src={self.props.packagingSelection[selectionType][key]['imageBase64']} alt="" />
          {JSON.stringify(self.props.packagingSelection[selectionType][key])}
        </div>
      ))
    }

  render() {
    let wrapPackaging = this.generatePackagingImagePreview(CONSTS.BAR_MOLD_CATEGORIES_ARRAY[0]);
    let overwrapPackaging = this.generatePackagingImagePreview(CONSTS.BAR_MOLD_CATEGORIES_ARRAY[1]);
    let labelPackaging = this.generatePackagingImagePreview(CONSTS.BAR_MOLD_CATEGORIES_ARRAY[2]);

    return (
      <div>
        {wrapPackaging}
        {overwrapPackaging}
        {labelPackaging}
      </div>
    )
  }
}

class BarPreview extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      bar : null
    };
  }


  // Get data from DB in this function
  async componentDidMount() {
    let self = this;

    if (this.props.barId) {
      const docRef = this.props.firebase.db.collection("barsPublic").doc(this.props.barId);
      await docRef.get().then(function(doc) {
        let bar = null;
        console.log(self.props.barId, doc.data());
        if (doc.exists) {
          bar = doc.data();
        }
        self.setState({bar});
      });
    }
  }


  render() {
    if (!this.state.bar) {
      return (<div>No bar found</div>)
    }

    let packagingSelection = <PackagingSelection packagingSelection={this.state.bar.packagingSelection} />
    return(
      <div>
        <img src={this.state.bar.moldImageBase64} alt="This is what your bar should look like!" className="barPreviewMold" />
        <div className="barPreviewPackaging">{packagingSelection}</div>
      PREVIEW BAR :
      </div>
    )
  }

}

export default BarPreview;
