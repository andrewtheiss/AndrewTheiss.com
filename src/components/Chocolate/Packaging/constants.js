export const PACKAGING_DEFAULT_DETAILS = {
  label : '',
  category : 'Wrap',
  quantity : '',

  // Price is standardized with Ingredients and other areas so we can add more
  costPerItem: '',
  countPurchased : '',
  latestPurchasePrice : '',
  latestAverageCostPerUnit : '',

  unitsPerItem : '',        // Roll of cardstock takes up lots of room
  unitsPerItemComments : '',
  percentWaste : '',

  purchaseFromUrl : '',
  imageBase64 : '',
  notes : ''
}

export const PACKAGING_DEFAULT_DETAILS_PUBLIC = {
  label : '',
  imageBase64 : '',
  latestAverageCostPerUnit : ''
}

export const PACKAGING_CATEGORIES = [
  'Wrap',
  'Overwrap',
  'Label'
]
