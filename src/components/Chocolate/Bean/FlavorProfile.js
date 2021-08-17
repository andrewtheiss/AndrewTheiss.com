import React from 'react';
import * as CONSTS from './constants.js'
import FlavorProfilePreview from './FlavorProfilePreview.js'
import './Bean.css'

class FlavorProfile extends React.Component {
  constructor(props) {
    super(props);
    this.onUpdateDetails = this.onUpdateDetails.bind(this);

    this.dimensions = {
      width: 500,
      height: 500
    };

    if (!this.props.flavorProfile) {
      this.state = CONSTS.FLAVOR_PROFILE;
    } else {
      this.state = this.props.flavorProfile;
    }
  }

  componentDidUpdate(prevProps) {

    // Only do something if there's a change
    if (this.props !== prevProps) {
      let isEdit = this.props.itemSelectedForEdit;

      // If there's something to edit or the props don't match the default
      if (isEdit) {
        // Save the selected label we selected for edit
        if (this.props.flavorProfile) {
          let flavorProfile = this.props.flavorProfile;
          this.setState(flavorProfile);
        }
      }
    }
  }

  async onUpdateDetails(event) {
    var state = this.state;
    state[event.target.name] = Number(event.target.value);
    await this.setState(state);

    if (this.props.onUpdate) {
      this.props.onUpdate(this.state);
    }
  }

  render() {
    let beanFlavorProfileArray = {
      flavorArrays : CONSTS.GetFlavorProfileAsArrays(this.props.flavorProfile)
    };
    return (
      <div>
        <div className="flavorProfileAdditionDetails">
        <h5>Flavor Profile</h5>
        Acidity:  <input name="acidity"  onChange={this.onUpdateDetails} value={this.state.acidity} size="5" type="text"></input><br />
        Astringent:  <input name="astringent"  onChange={this.onUpdateDetails} value={this.state.astringent} size="5" type="text"></input><br />
        Bitter:  <input name="bitter"  onChange={this.onUpdateDetails} value={this.state.bitter} size="5" type="text"></input><br />
        Chocolate:  <input name="chocolate"  onChange={this.onUpdateDetails} value={this.state.chocolate} size="5" type="text"></input><br />
        Earthy:  <input name="earthy"  onChange={this.onUpdateDetails} value={this.state.earthy} size="5" type="text"></input><br />
        Floral:  <input name="floral"  onChange={this.onUpdateDetails} value={this.state.floral} size="5" type="text"></input><br />
        Fruity:  <input name="fruity"  onChange={this.onUpdateDetails} value={this.state.fruity} size="5" type="text"></input><br />
        Nutty:  <input name="nutty"  onChange={this.onUpdateDetails} value={this.state.nutty} size="5" type="text"></input><br />
        Sweet:  <input name="sweet"  onChange={this.onUpdateDetails} value={this.state.sweet} size="5" type="text"></input><br />
        </div>
        <div className="flavorProfileAdditionPreview">
          <FlavorProfilePreview bean={beanFlavorProfileArray} dimensions={this.dimensions} key="b3" />
        </div>
      </div>
    )
  }
}

export default FlavorProfile;
