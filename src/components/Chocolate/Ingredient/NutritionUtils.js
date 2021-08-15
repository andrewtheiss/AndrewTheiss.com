export const GenerateOrderedIngredientList = function(ingredients, ingredientsDbList) {
  let ingredientString = "Ingredients: ";

  // Go through ingredients and get their correct names...
  let correctedIngredients = {};
  for (var ingredient in ingredients) {

    // Check if cacao beans (as they are listed by the actual Bean type and not ingredient name)
    if (!ingredientsDbList[ingredient]) {

      // Get the DB name for Cacao Beans and set value to 0 if there's no amount yet
      let label = ingredientsDbList['Cacao Beans'].nutritionFactsIngredientLabel;
      if (!correctedIngredients[label]) {
        correctedIngredients[label] = 0;
      }
      correctedIngredients[label] += ingredients[ingredient];
    } else {
      let correctLabel = ingredientsDbList[ingredient].nutritionFactsIngredientLabel;
      correctedIngredients[correctLabel] = ingredients[ingredient];
    }
  }
  ingredients = correctedIngredients;
  let ingredientsArray = [];
  let totalWeight = 0;
  for (ingredient in ingredients) {
    totalWeight += ingredients[ingredient];
    ingredientsArray.push([ingredient, ingredients[ingredient]]);
  }

  ingredientsArray.sort(function(a, b) {
      return b[1] - a[1];
  });

  // Find boundary for ingredients which 'Contains 2% or less of the following:'
  let twoPercent = totalWeight * 0.02;
  let flaggedTwoPercent = false;

  // Render ingredient list sorted by ingredient weight
  for (var i = 0; i < ingredientsArray.length; i++) {
    if (!flaggedTwoPercent && (ingredientsArray[i][1] < twoPercent)) {
      flaggedTwoPercent = true;
      ingredientString += 'Contains 2% or less of the following: ';
    }
    ingredientString += ingredientsArray[i][0];
    if (i !== ingredientsArray.length - 1) {
      ingredientString += ", ";
    } else {
      ingredientString += ".";
    }
  }

  return ingredientString;
}
