
/*
var cookie = document.cookie;
if (!cookie) {
  cookie = 1;
} else {
  cookie++;
}
document.cookie = cookie;
alert(cookie);
*/

function unloadContent() {
  // Using jquery
  $("#main_container").html('');

  // Add style or remove style
  $("#main_container").removeClass("choco-style");
  $("#body").removeClass("choco-bg");
}

function loadContent(result) {
  unloadContent();
  $("#main_container").html(result);
}

function loadContentChocolate(result) {
  unloadContent();
  $("#main_container").html(result);
  $("#main_container").addClass("choco-style");
  $("#body").addClass("choco-bg");
}

function requestChocolateContent() {
  unloadContent();
  $.ajax({url: "/pages/chocolate/index.html", success: loadContentChocolate});
}

function requestChocolateMeditation() {
  unloadContent();
  $.ajax({url: "/pages/meditation.html", success: loadContent});
}

function requestChocolateVisuals() {
  unloadContent();
  $.ajax({url: "/pages/visuals.html", success: loadContent});
}

function loadGame (htmlContent) {
  $("#game_content").html(htmlContent);
}

function requestGame() {
  $.ajax({
    url: "/pages/game.html",
    success: loadGame
  });
}



function requestHome() {
  unloadContent();
  $.ajax({
    url: "/pages/splash/splash.html",
    success: loadContent
  });
}


function playAudio() {
  var x = document.getElementById("myAudio");
  x.play();
}
$('#myAudio').mouseover(playAudio);



// Events
$("#load_chocolate").click(requestChocolateContent);
$("#load_meditation").click(requestChocolateMeditation);
$("#load_visuals").click(requestChocolateVisuals);
$("#load_game").click(requestGame);
$("#home").click(requestChocolateContent);
requestChocolateContent();
// Document 'ready' function is called when all content is loaded
