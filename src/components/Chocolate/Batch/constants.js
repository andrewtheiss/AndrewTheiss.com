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

export const DEFUALT_BATCH_DETAILS = {
  label : '000-2021-00A',
  creation : '2021-02-07',
  grindInHours : 48,
  intention : [],
  notes : '',
  archive : false
}

export const CHOCOLATE_BATCH_DEFAULTS = {
  Beans : [],
  Sweetener : [],
  Dairy : [],
  Cocoa : [],
  Other : [],
  Details : DEFUALT_BATCH_DETAILS
}

export const NON_BEAN_INGREDIENT_CATEGORIES = ['Cocoa','Dairy','Other','Sweetener'];
