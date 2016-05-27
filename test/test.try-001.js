casper.start('http://localhost:3000', function(result) {
  casper.test.assert(result.status === 200, 'Front page opens');
  casper.test.assertSelectorHasText('h2.base--h2.use--header', 'Try the service');

  casper.then(function() {
    this.click('#use--image0_default');
  });

  casper.waitForSelector('table.faces-table h3.base--h3', function() {
    casper.test.assertSelectorHasText('table.faces-table h3.base--h3', 'Faces');
    casper.test.assertTextExists('Whoopi Goldberg', 'We found Whoopi');
  });
});

casper.run(function() {
  this.test.done();
});
