import * as NUTRITION_UTILS from '../../Ingredient/NutritionUtils.js'

export const ExtractBeansFromIngredientList = function(beansDbList, batchesIngredients) {
  let beans = {};
  for (var potentialBeanIdx in batchesIngredients) {
      if (beansDbList[potentialBeanIdx]) {
          beans[potentialBeanIdx] = beansDbList[potentialBeanIdx];
      }
  }
  return beans;
}

export const RecalculateNutritionFactsPerGram = async function(batchesIncluded, batchesCollectionRef, docIdPath, ingredientsDbList, beansDbList) {
  let nutritionFacts = {};
  let batchesIngredients = {};
  let ingredientsLabel = "";
  let beans = {};

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

        ingredientsLabel = NUTRITION_UTILS.GenerateOrderedIngredientList(batchIngredients, ingredientsDbList);
      });
    }).catch((error) => {
      console.log('failure' , error);
    });

    // Grab beans out from ingredients and beansDbList
    beans = ExtractBeansFromIngredientList(beansDbList, batchesIngredients);
  }



  // Generate Ingredients label
  return [nutritionFacts, batchesIngredients, ingredientsLabel, beans];
}

export const AdjustNutritionFactsAndServingSizeForBar = function(nutritionFacts, barMold) {
  let adjustedNutritionFacts = {};

  // Figure out how much we want to adjust serving size to be
  let adjustmentMultiplier = Number(nutritionFacts.barWeight) / barMold.nutritionFacts.servingSizeInGrams;

  // Get serving size in pieces from barMold
  let barPieceCount = nutritionFacts.barPieceCount;
  let barServingSizeInPieces = Number(nutritionFacts.barServingSizeInPieces);

  let servingSizeOverride = Number(barServingSizeInPieces);
  let servingsPerContainerOverride = barPieceCount / barServingSizeInPieces;
  let servingsPerContainerOverrideText = servingsPerContainerOverride;
  if (barServingSizeInPieces < 1) {
    // Need to display '1/2 bar or 1/4 bar'
    if (barServingSizeInPieces === 0.5) {
      servingSizeOverride = "1/2 bar";
      servingsPerContainerOverride = 2;
    } else if (barServingSizeInPieces === 0.25) {
      servingSizeOverride = "1/4 bar";
      servingsPerContainerOverride = 4;
    } else if (barServingSizeInPieces === 0.33) {
      servingSizeOverride = "1/3 bar";
      servingsPerContainerOverride = 3;
    } else if (barServingSizeInPieces === 0) {
      servingSizeOverride = "1 bar";
      servingsPerContainerOverride = 1;
    } else {
      alert('bar size not supported');
    }
    servingsPerContainerOverrideText = servingsPerContainerOverride;
  } else {
    if (servingsPerContainerOverride !== Math.round(servingsPerContainerOverride)) {
      servingSizeOverride = Math.round(barServingSizeInPieces) + " pieces";
      servingsPerContainerOverrideText = "About " + servingsPerContainerOverride;
    } else {
      servingSizeOverride = barServingSizeInPieces + " pieces";
    }
  }

  // Calculate nutrition Facts
  Object.keys(barMold.nutritionFacts).forEach(key => {
    if (adjustedNutritionFacts[key] === undefined) {
      adjustedNutritionFacts[key] = 0;
    }
    if (key === 'servingsPerContainer') {
      adjustedNutritionFacts[key] = 1;
      adjustedNutritionFacts['servingsPerContainerOverride'] = servingsPerContainerOverrideText;
    } else if (key === 'servingSizeInGrams') {
      adjustedNutritionFacts[key] = Number(nutritionFacts.barWeight);
      adjustedNutritionFacts['servingSizeOverride'] = servingSizeOverride + " (" + Math.round(Number(nutritionFacts.barWeight)/servingsPerContainerOverride) + "g)";
    } else {
      adjustedNutritionFacts[key] = Math.round((Number(barMold.nutritionFacts[key]) * adjustmentMultiplier)/servingsPerContainerOverride);
    }
  });
  return adjustedNutritionFacts;
}
