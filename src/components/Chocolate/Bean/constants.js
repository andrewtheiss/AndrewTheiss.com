export const FLAVOR_PROFILE = {
  acidity : 0,
  astringent : 0,
  bitter : 0,
  chocolate : 0,
  earthy : 0,
  floral : 0,
  fruity : 0,
  nutty : 0,
  sweet : 0
}

export const BEAN_DEFAULT_PROPS = {
  alchemistNotes : '',
  flavorProfile : FLAVOR_PROFILE,
  imageBase64 : '',
  label : '',
  displayLabel : '',
  notes : '',
  price : 0,
  purchaseLbs : 0
}

export const GetFlavorProfileAsArrays = function(dataMap) {
  let flavorArrays = [];
  for (const value in dataMap) {
    flavorArrays.push([value[0].toUpperCase() + value.substring(1), dataMap[value]]);
  }
  flavorArrays.sort(function(a,b) {
    return a[0].localeCompare(b[0]);
  });
  return flavorArrays;
}
