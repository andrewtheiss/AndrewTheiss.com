export const BEAN_DEFAULT = {
  beanId : '',
  nibWeightInGrams : 0,
  beanWeightInGrams : 0,
  roast : {
    0 : {elapsedTimeInMinutes : 0, tempInF : 80}
  },
  finalTemp : {
    high : 0,
    low : 0,
    average : 0
  },
  pricePerKilogram : ''
}

export const ROAST_INITIAL = {elapsedTimeInMinutes : 0, tempInF : 80};
export const ROAST_EMPTY = {elapsedTimeInMinutes : 0, tempInF : 0};
export const ROAST = {
  roast : {
    0 : {elapsedTimeInMinutes : 0, tempInF : 0}
  },
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
