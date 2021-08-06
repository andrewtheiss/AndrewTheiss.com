export const BATCHES_PCT_INCLUDED = {

}

export const DEFAULT_BAR = {
  label : '',

  // proportion of a batch poured into a bar
  // * Can be multiple percentages of different batches {..00A : 100%, ..00B : 25%}
  batchesPctIncluded : BATCHES_PCT_INCLUDED,
  
  // How many bars are poured for this batch and from what molds
  barsFromMolds : {

  },

  samePackagingForAllBars : false,
  packgingSelection : {

  },
  packagingSelectionForIndividualBar : {

  },

  // Why are we making this bar?
  intentions : {

  },

  // Is this bar part of a tasting set?
  tastingIDs : {

  }
}
