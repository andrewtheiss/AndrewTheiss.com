export const TASTING_DEFAULT_PROPS = {
  label : '',
  bars : [],
  tasting : '',
  barAnswers : {},  // Maybe have Static types of bar answers
  notes : '',

  // To be removed before edit
  allBars : {},
  barsSelected : [],
  tastingSelection: [],
  allBarsSelectionOptions : []
}

export const TASTING_DEFAULT_PROPS_OBJECT_FOR_WRITE = {
  label : '',
  bars : [],
  tasting : '',
  barAnswers : {},  // Maybe have Static types of bar answers
  notes : ''
}

export const TASTING_TYPES = [
  {label : 'Sweetness', value : 'Sweetness'},
  {label : 'Bean', value : 'Bean'},
  {label : 'Milk', value : 'Milk'},
  {label : 'Specific Ingredient', value : 'Specific Ingredient'},
  {label : 'Roast', value : 'Roast'}
]
