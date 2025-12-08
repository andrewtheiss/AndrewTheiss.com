import React from 'react';
/**
 *  ImageUpload
 *
 *  Input Props:
 *  onUpdateImage :  function  to update parent state
 *  allowedSize   :   (optional) size to constrain upload
 *
 *  Usage:
 *  <ImageUpload onUpdate={this.updateImage} image={this.state.image} />
 *
 *  Notes:
 *  Default Allowed Size: 500000
 *
 *  Recommended Method:

   updateImage(imageUpload) {
     let imageBase64 = imageUpload.image;
     this.setState({imageBase64});
   }

 *
 */

class ImageUploadStorage extends React.Component {
  constructor(props) {
    super(props);

    this.componentDidUpdate = this.componentDidUpdate.bind(this);
    this.handleChange = this.handleChange.bind(this);

    this.state = {
      file: null,
      setFile: null,
      tastingLabel: this.props.tastingLabel
    };

  }

  async componentDidUpdate(previousProps) {
    if (previousProps.tastingLabel !== this.props.tastingLabel) {
      if (this.props.tastingLabel) {
        let tastingLabel = this.props.tastingLabel;
        await this.setState({ tastingLabel });
        this.getFileUrl();
      }
    }
  }

  // Handles input change event and updates state
  async handleChange(event) {
    this.setState({ file: event.target.files[0] });
    // convert filename

    if (this.state.tastingLabel === "") {
      console.log('No Name for tasting');
      return;
    }
    await this.props.firebase.uploadFile(event.target.files[0], 'tastings', this.state.tastingLabel); // Image is the image name
    this.getFileUrl();
  }

  async getFileUrl() {
    let existingImage = await this.props.firebase.getFileUrl('tastings', this.state.tastingLabel);
    console.log(existingImage);
    await this.setState({ imageUrl: existingImage });
  }

  render() {
    let errorHidden = ''; //this.renderError(this.state.error);
    return (
      <div key="imageUpload">
        <div>Upload Image:   {errorHidden}</div>
        <div>
          <input type="file" accept="image/*" onChange={this.handleChange} />
          <button>Upload to Firebase</button>
        </div>
        <img id="img" height="150" alt="" src={this.state.imageUrl} />
      </div>
    );
  }
}
export default ImageUploadStorage;
