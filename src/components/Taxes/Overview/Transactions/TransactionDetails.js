const transaction = this.props.firebase.db.collection("beans");
let self = this;
beanCollectionRef.get().then(function(beanCollectionDocs) {
  var beansMap = {};
  beanCollectionDocs.forEach(function(doc) {
    beansMap[doc.id] = doc.data();
  });

  self.setState({
    beans : beansMap
  });
});
