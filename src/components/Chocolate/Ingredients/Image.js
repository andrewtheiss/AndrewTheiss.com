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
    console.log(props);
    this.state = {
      image : ''
    };
  }

  handleFileRead = async (event) => {
    const file = event.target.files[0]
    const image = await this.convertBase64(file);

    // Validate image is correct size and dimensions
    
    await this.setState({image});
    await this.props.onUpdate(this.state);
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

  render() {
    return (
      <div key="ingredientImageUpload">
        <div>Upload Image</div>
        <input id="inp" type="file"  onChange={e => this.handleFileRead(e)} ></input>
        <p id="b64"></p>
        <img id="img" height="150" />
      </div>
    );
  }
}
 export default IngredientImage;
