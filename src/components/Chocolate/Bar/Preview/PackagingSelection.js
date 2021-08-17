import React from 'react';
import * as CONSTS from '../constants.js'

class PreviewPackagingSelection extends React.Component {
  constructor(props) {
    super(props);
    this.generatePackagingImagePreview = this.generatePackagingImagePreview.bind(this);
  }

    generatePackagingImagePreview(selectionType) {
      if (!this.props.packagingSelection) {
        return <div></div>
      }
      console.log(selectionType);
      let self = this;
      return Object.keys(this.props.packagingSelection[selectionType]).map((key) => (
        <div key={key} className="barPreviewPackagingSelectionTypeSingleItemContainer">
          <b className="barSelectionTypeSingleItemDisplayLabel">{self.props.packagingSelection[selectionType][key]['displayLabel']}</b>
          <img src={self.props.packagingSelection[selectionType][key]['imageBase64']} alt="" className="barPreviewPackagingImg" />
        </div>
      ))
    }

  render() {
    let wrapPackaging = this.generatePackagingImagePreview(CONSTS.BAR_MOLD_CATEGORIES_ARRAY[0]);
    let overwrapPackaging = this.generatePackagingImagePreview(CONSTS.BAR_MOLD_CATEGORIES_ARRAY[1]);
    let labelPackaging = this.generatePackagingImagePreview(CONSTS.BAR_MOLD_CATEGORIES_ARRAY[2]);

    return (
      <div>
      <b className="barPreviewPackagingTitle">Packaging:</b><br className="barPreviewClearBoth" />
        {wrapPackaging}
        {overwrapPackaging}
        {labelPackaging}
      </div>
    )
  }
}

export default PreviewPackagingSelection;
