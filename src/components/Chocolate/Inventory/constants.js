export const BEAN_DEFAULT = {
  beanId : '',
  weightInKg : '',
  roast : [[0,80]],
  finalTemp : {
    high : 0,
    low : 0,
    average : 0
  },
  pricePerKilogram : ''
}

export const ROAST_INITIAL = [0,80];
export const ROAST_EMPTY = [0,0];
export const ROAST = {
  roast : [
    [0,80]
  ],
  finalTemp : {
    high : '',
    low : '',
    average : ''
  }
}


export const CHOCOLATE_DEFAULTS = {

  // Date should be autofilled after
  time : {
    grind : {
      start : '',
      finish : '',
      totalHours : ''
    },
    packaged : ''
  },

  // Ingredient all of which are optional segments
  Ingredient : {
     // Beans
     beans : {

     },
     // Sweeteners
     sweeteners : {

     },

     // Dairy
     dairy : {

     },

     // Extras
     extras : {

     }
  },

  //
  notes : {
    kgYield : '',
    comments : '',
    packaging : '',
    myReview : '',
    toImprove : ''
  }

  //
}
