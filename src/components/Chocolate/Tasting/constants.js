export const TASTING_DEFAULT_PROPS = {
  label : '',
  bars : [],
  type : '',
  notes : '',
  notesMinor : '',

  // To be removed before edit
  allBars : {},
  barsSelected : [],
  tastingTypeSelection: [],
  allBarsSelectionOptions : []
}

export const TASTING_DEFAULT_PROPS_OBJECT_FOR_WRITE = {
  label : '',
  bars : [],
  type : '',
  barAnswers : {},  // Maybe have Static types of bar answers
  notes : '',
  notesMinor : ''
}

export const TASTING_TYPES = [
  {label : 'Sweetener', value : 'Sweetener'},
  {label : 'Cacao', value : 'Cacao'},
  {label : 'Dairy', value : 'Dairy'},
  {label : 'Cocoa', value : 'Cocoa'},
  {label : 'Other', value : 'Other'},
  {label : 'Roast', value : 'Roast'}
]
