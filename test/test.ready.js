casper.start('http://localhost:3000/ready/default', function(result) {
  casper.test.assert(result.status === 404, 'default is never found');
});

casper.run(function() {
  this.test.done();
});
