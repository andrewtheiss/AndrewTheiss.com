function unloadContent() {
  // Using jquery
  $("#main_container").html('');

  // Using Javascript
  document.getElementById("main_container").innerHTML = "";

  // Add style or remove style
  $("#main_container").removeClass("choco-style");
}


// ==================================================================
function loadContentForChocolate(result) {
  document.getElementById("demo").innerHTML = "Hello World!";
}

function loadContent(result) {
  unloadContent();
  $("#main_container").html(result);
}


function loadContentChocolate(result) {
  unloadContent();
  $("#main_container").html(result);
  $("#main_container").addClass("choco-style");
}




function requestChocolateContent() {
  unloadContent();
  $.ajax({url: "/pages/chocolate.html", success: loadContentChocolate});
}

function requestChocolateMeditation() {
  unloadContent();
  $.ajax({url: "/pages/meditation.html", success: loadContent});
}

function requestChocolateVisuals() {
  unloadContent();
  $.ajax({url: "/pages/visuals.html", success: loadContent});
}
function requestHome() {
  unloadContent();
  $.ajax({url: "/pages/splash.html", success: loadContent});
}


document.getElementById("go_to_hw").onclick = function () {
    location.href = "http://www.hw.com";
};


// Events
$("#load_chocolate").click(requestChocolateContent);
$("#load_meditation").click(requestChocolateMeditation);
$("#load_visuals").click(requestChocolateVisuals);
$("#home").click(requestHome);



$.ajax({url: "/pages/splash.html", success: loadContent});
// Document 'ready' function is called when all content is loaded
