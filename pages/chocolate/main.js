function loadChocolateJSONAsHTML(result) {
  console.log(result);
  var myString = "";
  for (var i = 0; i < result.length; i++) {
    var nextResult = result[i];

    myString += "<h2>" + nextResult['type'] + "</h2>";
  }

  // Set the HTML
  $("#list_chocolates").html(myString);
}

function handleChocolateExplorationCodeReturn(data) {
  console.log(data);
}


function generalErrorHandler(errer) {
    console.log("Got an error", error);
};

function loadChocolateExplorationCodeAsHtml(experience) {
  $('#chocolate_experience_container').html(experience);
}

function loadChocolateExplorationCode() {
    var chocolateSubmissionCode = $("#chocolate_code").val();

    // Connect to firebase and store in variable firestore
    //var firestore = firebase.firestore();
    location.href="/pages/chocolate/experiences/" + chocolateSubmissionCode + ".html";
    //const databaseCollectionRef = firestore.collection(chocolateSubmissionCode);
    //databaseCollectionRef.get().then(handleChocolateExplorationCodeReturn).catch(generalErrorHandler);
    $.ajax({
      dataType: "json",
      url: "/pages/chocolate/experiences/" + chocolateSubmissionCode + ".html",
      success : loadChocolateExplorationCodeAsHtml,
      //complete: loadChocolateJSONAsHTML
    });
    $('#chocolate_request_form_container').addClass('hidden');
    $('#chocolate_experience_container').removeClass('hidden');
}


function requestChocolateData() {
  // Load chocolates JSON
  $.ajax({
    dataType: "json",
    url: "https://firebasestorage.googleapis.com/v0/b/advancedtopicscs.appspot.com/o/chocolates.json?alt=media&token=bcf79ec6-97c7-4156-b311-c0dde4f2ba22",
    success : loadChocolateJSONAsHTML,
    //complete: loadChocolateJSONAsHTML
  });
}

function createBindings() {
  $("#chocolate_code").on( "keydown", function(event) {
      if(event.which == 13)
         loadChocolateExplorationCode();
    });
  $("#chocolate_submit").click(loadChocolateExplorationCode);
}
createBindings();

//requestChocolateData();


/*
Welcome to Cloud Shell! Type "help" to get started.
To set your Cloud Platform project in this session use “gcloud config set project [PROJECT_ID]”
andrew_theiss@cloudshell:~$ gsutil cors set cors.json gs://advancedtopicscs.appspot.com/chocolates.json
CommandException: "cors" command must specify a bucket
andrew_theiss@cloudshell:~$ gsutil cors set cors.json gs://advancedtopicscs.appspot.com              Setting CORS on gs://advancedtopicscs.appspot.com/...
andrew_theiss@cloudshell:~$

https://firebase.google.com/docs/storage/web/download-files#cors_configuration

https://console.cloud.google.com/home/dashboard?pli=1&project=theiss-animations&folder&organizationId&cloudshell=true

https://stackoverflow.com/questions/37760695/firebase-storage-and-access-control-allow-origin
*/
