import React from 'react';
import BeanPreparation from './BeanPreparation/BeanPreparation.js'
import IngredientSelection from '../Ingredient/Selection.js'
import BatchDetails from './Details.js'
import BeanPreparationSummary from './BeanPreparation/BeanPreparationSummary.js'
import  { FirebaseContext } from '../../Firebase';
import * as CONSTS from './constants.js'


class CombineBatchIngredients extends React.Component {
  constructor(props) {
    super(props);
    this.onAddBean = this.onAddBean.bind(this);
    this.onChangeSelection = this.onChangeSelection.bind(this);
    this.onChangeDetails = this.onChangeDetails.bind(this);
    this.onRemoveBean = this.onRemoveBean.bind(this);
    this.componentDidUpdate = this.componentDidUpdate.bind(this);
    this.state = CONSTS.CHOCOLATE_BATCH_DEFAULTS;

  }

  componentDidUpdate(previousProps) {
    if (previousProps.selectedIngredients !== this.props.selectedIngredients) {
      if (this.props.selectedIngredients.values) {
        let state = this.props.selectedIngredients.values;
        this.setState(state);
      }
    }
  }

  onAddBean(newBean) {
    let newBeanObj = JSON.parse(JSON.stringify(newBean));
    var Beans = this.state.Beans;
    Beans.push(newBeanObj);
    this.setState({Beans});
    this.props.onChange(this.state);
  }

  onChangeSelection(selectionType, values) {
    this.setState({[selectionType]:values});
    this.props.onChange(this.state);
  }

  onChangeDetails(Details) {
    this.setState({Details:Details});
    this.props.onChange(this.state);
  }

  onRemoveBean(beanIndex) {
    var Beans = this.state.Beans;
    Beans.splice(Number(beanIndex), 1);
    this.setState({Beans});
    this.props.onChange(this.state);
  }

  render() {
    var beanSummaryViewer = <BeanPreparationSummary input={this.state.Beans} name="Bean Viewer" onRemoveBean={this.onRemoveBean} onEditBean={this.onEditBean}/>;
    return (
      <div>
        <BeanPreparation name="beans" onAddBean={this.onAddBean} />
        {beanSummaryViewer}
        <IngredientSelection input={this.state.Dairy} name="Dairy" onChangeSelection={this.onChangeSelection} />
        <IngredientSelection input={this.state.Sweetener} name="Sweetener" onChangeSelection={this.onChangeSelection} />
        <IngredientSelection input={this.state.Cocoa} name="Cocoa" onChangeSelection={this.onChangeSelection} />
        <IngredientSelection input={this.state.Other} name="Other" onChangeSelection={this.onChangeSelection} />
        <FirebaseContext.Consumer>
            {firebase => <BatchDetails input={this.state.Details} name="Details" onChangeDetails={this.onChangeDetails} firebase={firebase}/>}
        </FirebaseContext.Consumer>
      </div>
    );
  }
}

export default CombineBatchIngredients;

//
