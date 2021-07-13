
export const NUTRITION_FACTS = {
  servingsPerContainer : 1,
  servingSizeInGrams: 0,

  // All items in Grams unless otherwise stated
  calories : 0,
  totalFat : 0,
  saturatedFat : 0,
  tarnsFat : 0,
  cholesterol : 0,
  sodium : 0,
  totalCarbohydrates : 0,
  dietaryFiber : 0,
  totalSugars : 0,
  addedSugars : 0,
  erythritol : 0,
  protein : 0,
  calcium : 0,
  iron : 0,
  potassium : 0,
  vitaminD : 0,
  vitaminC : 0,
  vitaminA : 0,
  betaCaseinA2 : 0,
  betaCaseinA1 : 0
};

export const NUTRITION_LABEL_STRINGS = {
  servingsPerContainer : 'Servings Per Container',
  servingSizeInGrams: 'Serving Size',
  caloriesPerServing : 'Calories Per Serving',
  caloriesPerGram : 'Calories Per Gram',
  calories : 'Calories',
  totalFat : 'Total Fat',
  saturatedFat : 'Saturated Fat',
  tarnsFat : 'Trans Fat',
  cholesterol : 'Cholesterol',
  sodium : 'Sodium',
  totalCarbohydrates : 'Total Carbohydrate',
  dietaryFiber : 'Dietary Fiber',
  totalSugars : 'Total Sugars',
  addedSugars : 'Added Sugars',
  erythritol : 'Erythritol',
  protein : 'Protein',
  calcium : 'Calcium',
  iron : 'Iron',
  potassium : 'Potassium',
  vitaminD : 'Vitamin D',
  vitaminC : 'Vitamin C',
  vitaminA : 'Vitamin A',
  betaCaseinA2 : 'Beta-casein A2',
  betaCaseinA1 : 'Beta-casein A1',
  name : 'Name',
  category : 'Category',
  notes : 'Notes',
  origin : 'Origin',
  source : 'Source',
  totalWeightPerItem : 'Total Weight Per Item',
  pricePerKg : 'Price Per Kg',
  countPurchased : 'Number of Items Purchased',
  latestPurchasePrice : 'Latest Purchase Price',
  runningTotalOfPurchasedCosts : 'Running Total of All Item Purchase Costs',
  nutritionFacts : 'Nutrition Facts',
  image : 'Image',
  categoryCategories : 'Category Categories',
  categorySelection : 'Category Selection'
}

export const NUTRITION_PLACEHOLDER_STRINGS = {
  name : 'Hoosier Hill Farm Whole Milk Powder',
  notes : 'A bit sweeter and less savory than euro milk',
  origin : 'USA',
  source : 'Amazon',
  totalWeightPerItem : '700 g',
  pricePerKg : '15.30',
  countPurchased : '1',
  latestPurchasePrice : '14.99',
  image : 'imgUrl or I DONT KNOW YET'
}

export const NUTRITION_MESUREMENTS = {
  cholesterol : 'mg',
  sodium : 'mg',
  vitaminD : 'mcg',
  calcium : 'mg',
  iron : 'mg',
  potassium : 'mg',
  vitamingA : 'ug'
};

export const NUTRITION_REQUIRED = {
  calories : true,
  totalFat : true,
  saturageFat : true,
  tarnsFat : true,
  cholesterol : true,
  sodium : true,
  totalCarbohydrates : true,
  dietaryFiber : true,
  totalSugars : true,
  addedSugars : true,
  protein : true,
  servingSizeInGrams : true
};

export const NUTRITION_BOLD_LABEL = {
  totalFat : true,
  sodium : true,
  totalCarbohydrates : true,
  protein : true,
  calories : true,
  servingSizeInGrams : true
};

// Category is mandatory but handled via select box
export const NON_NUTRITION_PARAMS = {
  name : '',
  notes : '',
  origin : '',
  source : '',
  totalWeightPerItem : '',
  pricePerKg : 0,
  countPurchased : 0,
  latestPurchasePrice : 0,
  image : ''
}

export const INGREDIENT_CATEGORIES = ['Dairy', 'Sweetener', 'Cocoa', 'Other'];
