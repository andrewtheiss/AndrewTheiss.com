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




function requestChocolateData() {
  // Load chocolates JSON
  $.ajax({
    dataType: "json",
    url: "https://firebasestorage.googleapis.com/v0/b/advancedtopicscs.appspot.com/o/chocolates.json?alt=media&token=bcf79ec6-97c7-4156-b311-c0dde4f2ba22",
    success : loadChocolateJSONAsHTML,
    //complete: loadChocolateJSONAsHTML
  });
}




requestChocolateData();


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
