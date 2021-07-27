
export const NUTRITION_FACTS = {
  servingsPerContainer : 1,
  servingSizeInGrams: 0,

  // All items in Grams unless otherwise stated
  calories : 0,
  totalFat : 0,
  saturatedFat : 0,
  transFat : 0,
  cholesterol : 0,
  sodium : 0,
  totalCarbohydrates : 0,
  dietaryFiber : 0,
  totalSugars : 0,
  addedSugars : 0,
  protein : 0,
  calcium : 0,
  iron : 0,
  potassium : 0,
  vitaminD : 0,
  vitaminC : 0,
  vitaminA : 0,
  magnesium : 0
};

export const NUTIRION_FACTS_SECONDARY_DETAILS = {

}

export const NUTRITION_LABEL_STRINGS = {
  servingsPerContainer : 'Servings Per Container',
  servingSizeInGrams: 'Serving Size',
  caloriesPerServing : 'Calories Per Serving',
  caloriesPerGram : 'Calories Per Gram',
  calories : 'Calories',
  totalFat : 'Total Fat',
  saturatedFat : 'Saturated Fat',
  transFat : 'Trans Fat',
  cholesterol : 'Cholesterol',
  sodium : 'Sodium',
  totalCarbohydrates : 'Total Carbohydrate',
  dietaryFiber : 'Dietary Fiber',
  totalSugars : 'Total Sugars',
  addedSugars : 'Added Sugars',
  protein : 'Protein',
  calcium : 'Calcium',
  iron : 'Iron',
  potassium : 'Potassium',
  vitaminD : 'Vitamin D',
  vitaminC : 'Vitamin C',
  vitaminA : 'Vitamin A',
  name : 'Name',
  category : 'Category',
  notes : 'Notes',
  origin : 'Company Origin',
  source : 'Source',
  totalGramWeightPerItem : 'Total Weight Per Item',
  costPerItem : 'Cost Per Item',
  latestPricePerKg : 'Latest Price Per Kg',
  countPurchased : 'Number of Items Purchased',
  latestPurchasePrice : 'Latest Purchase Price',
  runningTotalOfPurchasedCosts : 'Running Total of All Item Purchase Costs',
  nutritionFacts : 'Nutrition Facts',
  image : 'Image',
  categoryCategories : 'Category Categories',
  categorySelection : 'Category Selection',
  magnesium : 'Magnesium'
}

export const NUTRITION_PLACEHOLDER_STRINGS = {
  name : 'Hoosier Hill Farm Whole Milk Powder',
  notes : 'A bit sweeter and less savory than euro milk',
  origin : 'USA',
  source : 'Amazon',
  totalGramWeightPerItem : '700 g',
  costPerItem : '15.30',
  countPurchased : '1',
  latestPurchasePrice : '14.99'
}

export const NUTRITION_MESUREMENTS = {
  cholesterol : 'mg',
  sodium : 'mg',
  calcium : 'mg',
  iron : 'mg',
  potassium : 'mg',
  vitaminA : 'mcg',
  vitaminB6 : 'mg',
  vitaminB12 : 'mcg',
  vitaminC : 'mg',
  vitaminD : 'mcg',
  vitaminE : 'mg',
  vitaminK : 'mcg',
  magnesium : 'mg',
  manganese : 'mg',
  phosphorus : 'mg',
  biotin : 'mcg',
  chloride : 'mg',
  chormium : 'mcg',
  copper : 'mg',
  folicAcid : 'mcg',
  molybdenum: 'mcg',
  niacin : 'mg',
  pantothenicAcid : 'mg',
  riboflavin : 'mg',
  selenium : 'mcg',
  thaimin : 'mg',
  zinc : 'mg',
  iodine : 'mcg',
  choline : 'mg'
};

// From https://www.fda.gov/media/99069/download July 20, 2021
// and https://www.dietaryguidelines.gov/sites/default/files/2020-12/Dietary_Guidelines_for_Americans_2020-2025.pdf
// and https://www.accessdata.fda.gov/scripts/interactivenutritionfactslabel/assets/InteractiveNFL_TotalCarbohydrate_March2020.pdf
// and https://www.usda.gov/media/blog/2015/03/31/online-nutrition-resources-your-fingertips
export const NUTRITION_RECOMMENDED_DAILY_AMOUNT = {
  cholesterol : '300',
  sodium : '2300',
  calcium : '1300',
  iron : '18',
  potassium : '4700',
  vitaminA : '900',
  vitaminB6 : '1.7',
  vitaminB12 : '2.4',
  vitaminC : '90',
  vitaminD : '20',
  vitaminE : '15',
  vitaminK : '120',
  magnesium : '420',
  manganese : '2.3',
  phosphorus : '1250',
  biotin : '30',
  chloride : '2300',
  chormium : '35',
  copper : '0.9',
  folicAcid : '400',
  molybdenum: '45',
  niacin : '16',
  pantothenicAcid : '5',
  riboflavin : '1.3',
  selenium : '55',
  thaimin : '1.2',
  zinc : '11',
  iodine : '150',
  choline : '550',
  saturatedFat : '20',
  addedSugars : '50',
  totalFat : '50',
  totalCarbohydrates : '275',
  dietaryFiber : '28'
};

export const NUTRITION_REQUIRED = {
  calories : true,
  totalFat : true,
  saturatedFat : true,
  transFat : true,
  cholesterol : true,
  sodium : true,
  totalCarbohydrates : true,
  dietaryFiber : true,
  totalSugars : true,
  addedSugars : true,
  protein : true,
  servingSizeInGrams : true
};

export const NUTITION_FACTS_HIDE_PERCENT = {
  transFat : true,
  totalSugars : true,
  protein : true
}

export const NUTIRITION_FACTS_PERCENT_DAILY_VALUES = {
  totalFat : 3
}

/**
 *  Used to render Nutirion Facts main properties and determine spacing
 */
export const NUTRITION_FACTS_PRIMARY_DETAILS_ORDER_AND_TAB_INDENT = {
  totalFat : 0,
  saturatedFat : 1,
  transFat : 1,
  cholesterol : 0,
  sodium : 0,
  totalCarbohydrates : 0,
  dietaryFiber : 1,
  totalSugars : 1,
  addedSugars  : 2,
  protein : 0
};

// We only use this as a key-checker for secondary items showing or not
// We don't use the values for this CONST, use above values
export const NUTRITION_FACTS_SECONDARY_ITEMS = {
  calcium : '1300',
  iron : '18',
  potassium : '4700',
  vitaminA : '900',
  vitaminB6 : '1.7',
  vitaminB12 : '2.4',
  vitaminC : '90',
  vitaminD : '20',
  vitaminE : '15',
  vitaminK : '120',
  magnesium : '420',
  manganese : '2.3',
  phosphorus : '1250',
  biotin : '30',
  chloride : '2300',
  chormium : '35',
  copper : '0.9',
  folicAcid : '400',
  molybdenum: '45',
  niacin : '16',
  pantothenicAcid : '5',
  riboflavin : '1.3',
  selenium : '55',
  thaimin : '1.2',
  zinc : '11',
  iodine : '150',
  choline : '550'
};


// Category is mandatory but handled via select box
export const NON_NUTRITION_PARAMS = {
  name : '',
  notes : '',
  origin : '',
  source : '',
  totalGramWeightPerItem : '',
  costPerItem : 0,
  countPurchased : 0
}

export const INGREDIENT_CATEGORIES = ['Dairy', 'Sweetener', 'Cocoa', 'Other'];
export const BEAN_NUTRITION_DB_ID = "Cacao Beans";
