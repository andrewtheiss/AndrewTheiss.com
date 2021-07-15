import React from 'react';
/**
 *  IngredientImage
 *
 *  Input:
 *  onUpdateImage :  function  to update parent state
 */
class IngredientBuyMore extends React.Component {
  constructor(props) {
    super(props);
    console.log(props);
  }

  render() {
    return (
      <div key="ingredientBuyMore">
        Additional Purchased:<input type="text"></input>
        Additional Purchase Price: <input type="text" placeholder="latestCost"></input>
        Purchase Date: <input type="date"></input>
      </div>
    );
  }
}
 export default IngredientBuyMore;
