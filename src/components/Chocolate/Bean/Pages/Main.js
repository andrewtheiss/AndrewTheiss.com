import React from 'react';
import { FirebaseContext } from '../../../Firebase';
import AddEditBean from '../AddEdit.js'
import LookupSelection from '../../../Utils/LookupSelection.js'
import '../Bean.css'


class BeanMainPage extends React.Component {

  constructor(props) {
    super(props);
    this.onUpdateSelection = this.onUpdateSelection.bind(this);
    this.togglePageContentVisibilityDropdown = this.togglePageContentVisibilityDropdown.bind(this);

    this.state = {
      selectedBeanSingle : null,
      selectedBeans : null,
      allBeanData : null,
      pageContentVisibilityDropdownToggled : false
    };
  }

  onUpdateSelection(selectedBeanArray, selectedBeansData) {
    let selectedBean = undefined;

    if (selectedBeanArray && selectedBeanArray.length > 0) {
      selectedBean = selectedBeansData[selectedBeanArray[0].value];
    }
    let state = {
      selectedBeanSingle : selectedBean,
      selectedBeans : selectedBeanArray,
      allBeanData : selectedBeansData,
      pageContentVisibilityDropdownToggled : this.state.pageContentVisibilityDropdownToggled
    };
    this.setState(state);
  }


  togglePageContentVisibilityDropdown() {
    var pageContentVisibilityDropdownToggled = !this.state.pageContentVisibilityDropdownToggled;
    this.setState({pageContentVisibilityDropdownToggled});
  }

  render() {

    // Render without loading all data if we don't ever toggle visibility
    if (!this.state.pageContentVisibilityDropdownToggled)  {
      return (
        <div className="moldSizePageOutterContainer">
          <span><span className="carat"></span><h2 className="commonToggleDiv" onClick={this.togglePageContentVisibilityDropdown}>Bean</h2></span>
          <div className="moldSizeMainPageContainer hidden">
          </div>
        </div>
      );
    }
    let previewBeans = '';
    let showHideContent = (this.state.pageContentVisibilityDropdownToggled) ? "moldSizeMainPageContainer" : "moldSizeMainPageContainer hidden";
    let showHideCarat = (this.state.pageContentVisibilityDropdownToggled) ? "carat down" : "carat";
    return (
      <div className="moldSizePageOutterContainer">

      <FirebaseContext.Consumer>
        {firebase =>
            <LookupSelection
              firebase={firebase}
              onUpdateSelection={this.onUpdateSelection}
              collectionName="beans"
              displayTitle="Beans"
              allowMultiple={true}
              sendDataOnUpdate={true}
            />
          }
      </FirebaseContext.Consumer>
        <span><span className={showHideCarat}></span><h2 className="commonToggleDiv" onClick={this.togglePageContentVisibilityDropdown}>Bean</h2></span>
        <div className={showHideContent}>

          <FirebaseContext.Consumer>
            {firebase =>
              <AddEditBean
                firebase={firebase}
                itemSelectedForEdit={this.state.selectedBeanSingle}
              />
            }
          </FirebaseContext.Consumer>
          {previewBeans}
        </div>
      </div>
    );
  }
}

export default BeanMainPage;
