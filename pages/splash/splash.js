function loadNasaRss(result) {
  result = xmlToJson(result);
  var items = result['rss']['channel']['item'];

  var rand = Math.round(Math.random() * 1000000) % 50;

  var htmlStr = "";
  for (var i = 0; i < items.length; i++) {
    if (rand == i) {
      htmlStr += '<img src="' + items[i]['enclosure']['@attributes']['url'] + '"style="max-width:100%;max-height:100%;" alt="Wow, RSS Feeds are AMAZING!" >';
    }
  }
  // Set the HTML
  $("#npotd").html(htmlStr);
}

function requestNasaRss() {
  // Load chocolates JSON
  $.ajax({
    dataType: "xml",
    url: "https://cors-anywhere.herokuapp.com/https://www.nasa.gov/rss/dyn/lg_image_of_the_day.rss",
    success : loadNasaRss
  });
}

function requestRSSFeeds() {
//  requestNasaRss();
}


requestRSSFeeds();
