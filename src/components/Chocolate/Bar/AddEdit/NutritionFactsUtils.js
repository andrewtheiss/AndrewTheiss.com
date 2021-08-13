import * as NUTRITION_UTILS from '../../Ingredient/NutritionUtils.js'

export const RecalculateNutritionFactsPerGram = async function(batchesIncluded, batchesCollectionRef, docIdPath) {
  let nutritionFacts = {};
  let batchesIngredients = {};
  let ingredientsLabel = "";

  let ids = Object.keys(batchesIncluded);
  if (ids.length > 10) {
    alert('Firestore only allows 10 different batches to be returned at once...');
  }

  // Bug fix for deselecting everything
  if (ids.length > 0) {
    await batchesCollectionRef.where(docIdPath, 'in', ids).get().then((docs) => {
      docs.forEach(function(doc) {

        let nextDocNutritionFacts = doc.data().nutritionFacts;
        let nutritionFactsPct = batchesIncluded[doc.id];
        let batchIngredients = doc.data().batchIngredients;

        // Calculate nutrition Facts
        Object.keys(nextDocNutritionFacts).forEach(key => {
          if (nutritionFacts[key] === undefined) {
            nutritionFacts[key] = 0;
          }
          if (key === 'servingsPerContainer') {
            nutritionFacts[key] = 1
          } else {
            nutritionFacts[key] = Number(nutritionFacts[key]) + Math.round(nextDocNutritionFacts[key] * (nutritionFactsPct / 100));
          }
        });

        // Regenerate ingredient list
        Object.keys(batchIngredients).forEach(key => {
          if (batchesIngredients[key] === undefined) {
            batchesIngredients[key] = 0;
          }
          batchesIngredients[key] =+ Math.round(batchIngredients[key] * (nutritionFactsPct / 100));
        });

        ingredientsLabel = NUTRITION_UTILS.GenerateOrderedIngredientList(batchIngredients);
      });
    }).catch((error) => {
      console.log('failure' , error);
    });
  }

  // Generate Ingredients label
  return [nutritionFacts, batchesIngredients, ingredientsLabel];
}

export const AdjustNutritionFactsAndServingSizeForBar = function(nutritionFacts, barMold) {
  let adjustedNutritionFacts = {};

  // Figure out how much we want to adjust serving size to be
  let servingSizeTargetInGrams = 10;  // TARGET 10 Grams per serving
  let adjustmentMultiplier = Number(nutritionFacts.barWeight) / barMold.nutritionFacts.servingSizeInGrams;
  let roundedServingCount = Math.round(Number(nutritionFacts.barWeight) / servingSizeTargetInGrams);

  // Calculate nutrition Facts
  Object.keys(barMold.nutritionFacts).forEach(key => {
    if (adjustedNutritionFacts[key] === undefined) {
      adjustedNutritionFacts[key] = 0;
    }
    if (key === 'servingsPerContainer') {
      adjustedNutritionFacts[key] = Math.round(100*(Number(nutritionFacts.barWeight) / servingSizeTargetInGrams))/100;
      adjustedNutritionFacts['adjustedServingsPerContainer'] = "About " + roundedServingCount;
    } else if (key === 'servingSizeInGrams') {
      adjustedNutritionFacts[key] = servingSizeTargetInGrams;
    } else {
      adjustedNutritionFacts[key] = Math.round(Number(barMold.nutritionFacts[key]) * adjustmentMultiplier);
    }
  });
  return adjustedNutritionFacts;
}
