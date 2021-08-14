export const BATCHES_INCLUDED = {
  pct : {},
  cost : {},
  totalWeightInGrams : 0,
  totalCost : 0,
  nutritionFacts : {},
  batchIngredients : {},
  ingredients : {}
}

export const BAR_FROM_MOLD_DETAILS = {
  label : '',
  barCount : '',
  barWeight : '',
  moldId : '',
  barPieceCount : '',
  pricePerBar : 0,
  packagingPricesPerBar : {  // Should be packagingPricesPerBar
    wrap : 0,
    overwrap : 0,
    label : 0
  },
  totalPackagingPricePerUnit : 0,
  totalIngredientPricePerUnit : 0,
  packagingSelection : {
    wrap : {},
    overwrap : {},
    label : {}
  },
  nutritionFacts : {

  },
  ingredients : "",
  totals : {
    packagingPrice : 0,
    weight : 0
  }
}

export const BAR_MOLD_CATEGORIES_ARRAY = ['wrap', 'overwrap', 'label'];

export const BAR_MOLD_CATEGORIES_STRINGS = {
  wrap : 'wrap',
  overwrap : 'overwrap',
  label : 'label'
}

export const BAR_MOLD_DB_CATEGORIES_STRINGS = {
  wrap : 'Wrap',
  overwrap : 'Overwrap',
  label : 'Label'
}
export const DEFAULT_BAR = {
  label : '',

  // proportion of a batch poured into a bar
  // * Can be multiple percentages of different batches {..00A : 100%, ..00B : 25%}
  batchesIncluded : BATCHES_INCLUDED,

  nutritionFacts : {},
  ingerdients : {},

  // How many bars are poured for this batch and from what molds
  barsFromMolds : {
    barMoldDetails : {},
    totalWeightAllBars : 0,
    totalPackagingCostAllBars : 0
  },

  // Why are we making this bar?
  intentions : {

  },

  // Is this bar part of a tasting set?
  tastingIDs : {

  },

  dateCreated : '',
  comments : ''
}
