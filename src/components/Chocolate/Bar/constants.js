export const BATCHES_PCT_INCLUDED = {

}

export const BATCHES_DEFAULT_PCT_INCLUDED = {
  batchesPctIncluded : {},
  batchesSelected : []
}

export const BAR_FROM_MOLD_DETAILS = {
  barCount : '',
  barWeight : '',
  wrappingPricePerBar : '',
  overwrappingPricePerBar : '',
  labelPricePerBar : '',
  packgingSelection : {

  },

  // This is pretty low priority as everything "should" have the same for now!
  samePackagingForAllBars : true,
  packagingSelectionForIndividualBars : {},

  nutritionFacts : {},
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
  }

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
