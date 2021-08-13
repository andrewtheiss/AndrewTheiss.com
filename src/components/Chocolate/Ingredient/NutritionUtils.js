export const GenerateOrderedIngredientList = function(ingredients) {
  let ingredientString = "Ingredients: ";

  let ingredientsArray = [];
  let totalWeight = 0;
  for (var ingredient in ingredients) {
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
