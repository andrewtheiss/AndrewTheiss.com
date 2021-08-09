export const BATCHES_PCT_INCLUDED = {

}

export const BATCHES_DEFAULT_PCT_INCLUDED = {
  batchesPctIncluded : {},
  batchesSelected : []
}

export const BAR_FROM_MOLD_DETAILS = {
  barCount : '',
  barWeight : '',
  pricesPerBar : {
    wrap : 0,
    overwrap : 0,
    label : 0
  },
  totalPackagingPricePerUnit : 0,
  packagingSelection : {
    wrap : {},
    overwrap : {},
    label : {}
  },
  nutritionFacts : {

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
  batchesPctIncluded : BATCHES_PCT_INCLUDED,

  totals : {
    nutritionFacts : {

    },
    cost : ''
  },

  // How many bars are poured for this batch and from what molds
  barsFromMolds : {

  },

  // Why are we making this bar?
  intentions : {

  },

  // Is this bar part of a tasting set?
  tastingIDs : {

  }
}
