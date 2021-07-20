import React from 'react';
/**
 *  IngredientImage
 *
 *  Input:
 *  onUpdateImage :  function  to update parent state
 */
class IngredientImage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      image : '',
      error : ''
    };
  }

  handleFileRead = async (event) => {
    const file = event.target.files[0];
    var error = '';
    console.log(file, "file");
    const image = await this.convertBase64(file);

    // Validate image is correct size and dimensions
    if (file.size > 500000) {
      error += "File too large.  ";
    } else if (!file.type.startsWith('image/')){
      error += "File not an image.  File is " + file.type;
    }

    if (error === '') {
      await this.setState({error});
      await this.setState({image});
      await this.props.onUpdate(this.state);
    } else {
      await this.setState({error});
    }
  }
  convertBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const fileReader = new FileReader();
      fileReader.readAsDataURL(file)
      fileReader.onload = () => {
        resolve(fileReader.result);
      }
      fileReader.onerror = (error) => {
        reject(error);
      }
    })
  }

  renderError(error) {
     if (error === '') {
       return (<div></div>);
     }
     return (<div className="error"><b>{error}</b></div>);
  }

  render() {
    let errorHidden = this.renderError(this.state.error);
    return (
      <div key="ingredientImageUpload">
        <div>Upload Image:   {errorHidden}</div>
        <input id="inp" type="file"  onChange={e => this.handleFileRead(e)} ></input>
        <p id="b64"></p>
        <img id="img" height="150" src={this.state.image}/>
      </div>
    );
  }
}
 export default IngredientImage;
