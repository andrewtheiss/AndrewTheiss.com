function loadChocolateJSONAsHTML(result) {
  var myString = "";
  for (var i = 0; i < result.length; i++) {
    var nextResult = result[i];

    myString += "<h2>" + nextResult['type'] + "</h2>";
  }

  // Set the HTML
  $("#list_chocolates").html(myString);

}




function requestChocolateData() {
  // Load chocolates JSON
  $.ajax({
    dataType: "json",
    url: "/pages/chocolate/chocolates.json",
    success : loadChocolateJSONAsHTML,
    //complete: loadChocolateJSONAsHTML
  });
}




requestChocolateData();
