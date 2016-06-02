casper.start('http://localhost:3000/thermometer', function(result) {
  casper.test.assert(result.status == 400, 'no score gets a 400');
});

casper.thenOpen('http://localhost:3000/thermometer?score=0.5', function(result) {
  casper.test.assert(result.status == 200, 'valid score gets a 200');
  //casper.test.assert(body.score == 0.5, 'score is returned');
});

casper.thenOpen('http://localhost:3000/thermometer?score=-1', function(result) {
  casper.test.assert(result.status == 400, 'invalid score gets a 400');
  var body = JSON.parse(this.getPageContent());
  casper.test.assert(body.error == 'Score value invalid', 'error message is correct');
});

casper.run(function() {
  this.test.done();
});