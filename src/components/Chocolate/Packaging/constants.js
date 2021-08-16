
export const PACKAGING_CATEGORIES = [
  'Wrap',
  'Overwrap',
  'Label'
]


export const PACKAGING_DEFAULT_DETAILS = {
  label : '',
  displayLabel : '',
  category : '',
  categorySelection : [],
  categoryCategories : [
    {value : PACKAGING_CATEGORIES[0], label : PACKAGING_CATEGORIES[0]},
    {value : PACKAGING_CATEGORIES[1], label : PACKAGING_CATEGORIES[1]},
    {value : PACKAGING_CATEGORIES[2], label : PACKAGING_CATEGORIES[2]}
  ],

  // Price is standardized with Ingredients and other areas so we can add more
  purchasedPrice: '',
  purchasedCount : '',
  latestAverageCostPerUnit : '',
  latestAverageCostPerUnitBasedOnBarMold : {},

  unitsPerItem : '',        // Roll of cardstock takes up lots of room
  unitsPerItemComments : '',
  percentWaste : '',

  // Sometimes we may have different quantity of units per item based on bar size
  unitsPerItemAreBasedOnBarMold : false,
  unitsPerItemBasedOnBarMold : {},

  purchaseFromCompany : '',
  purchaseFromUrl : '',
  imageBase64 : '',
  notes : ''
}

export const PACKAGING_DEFAULT_DETAILS_PUBLIC = {
  label : '',
  displayLabel : '',
  imageBase64 : '',
  latestAverageCostPerUnit : ''
}
