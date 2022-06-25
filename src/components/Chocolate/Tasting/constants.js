export const TASTING_DEFAULT_PROPS = {
  label : '',
  bars : [],
  type : '',
  notes : '',
  notesMinor : '',
  difficulty : '',
  barAlphabeticalToTastingOrderMap : [],
  imageDimensions : {
    x : 200,
    y : 200
  },


  // To be removed before edit
  allBars : {},
  barsSelected : [],
  tastingTypeSelection: [],
  difficultySelection: [],
  allBarsSelectionOptions : []
}

export const TASTING_DEFAULT_PROPS_OBJECT_FOR_WRITE = {
  label : '',
  bars : [],
  type : '',
  barAnswers : {},  // Maybe have Static types of bar answers
  notes : '',
  notesMinor : '',
  difficulty : ''
}

export const TASTING_TYPES = [
  {label : 'Sweetener', value : 'Sweetener'},
  {label : 'Cacao', value : 'Cacao'},
  {label : 'Dairy', value : 'Dairy'},
  {label : 'Cocoa', value : 'Cocoa'},
  {label : 'Other', value : 'Other'},
  {label : 'Roast', value : 'Roast'}
]

export const TASTING_DIFFICULTY = [
  {label : 'Easy', value : 'Easy'},
  {label : 'Medium', value : 'Medium'},
  {label : 'Difficult', value : 'Difficult'},
  {label : 'Challenging', value : 'Challenging'}
]
