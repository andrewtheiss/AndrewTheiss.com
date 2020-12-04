const chocolateInput = $("#chocolate_input");
const latestChcocolateVote = $("#latest_vote");
const voteOnChocolate = $("#vote_chocolate");
const chocolateOutput = $("#chocolate_output");

var firestore = firebase.firestore();
const databaseDocumentRef = firestore.doc("chocolates/latestChocolateRating");



function voteSuccess() {
  console.log("vote saved!");
}

function generalErrorHandler(errer) {
    console.log("Got an error", error);
};

function submitChocolateVote() {
    console.log('submitting chocolate vote: ' + chocolateInput.val());
    databaseDocumentRef.set(
      {
          latestRating : chocolateInput.val()
      }
    ).then(voteSuccess).catch(generalErrorHandler);
}



voteOnChocolate.click(submitChocolateVote);

//  TODO
// Grab IP and create user by IP
// If your site is on Cloudflare, then you can use '/cdn-cgi/trace' instead
//$.get('https://www.cloudflare.com/cdn-cgi/trace', function(data) {
//    console.log(data)
//})

// https://www.youtube.com/watch?v=2Vf1D-rUMwE&feature=emb_logo @7:16 if
// we need to bypass firebase rules!

// Grab the data back!
function getChocolateVoteDocument(doc) {
  if (doc && doc.exists) {
    var myData = doc.data();
    chocolateOutput.html(myData.latestRating);
  }
}

function getLatestVote() {
  databaseDocumentRef.get().then(getChocolateVoteDocument).catch(generalErrorHandler);
}

latestChcocolateVote.click(getLatestVote);




// Realtime database
/*function getRealtimeUpdates() {
  databaseDocumentRef.onSnapshot(getChocolateVoteDocument);
}
getRealtimeUpdates();
*/
