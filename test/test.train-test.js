var system = require('system');
var apiKey = system.env.API_KEY;

casper.options.waitTimeout = 25000;

casper.start();

casper.thenBypassUnless(function() {
  return apiKey && apiKey.length > 0;
}, 2);

casper.thenOpen('http://localhost:3000/train', function(result) {
  casper.test.assert(result.status === 200, 'Front page opens');
  casper.test.assertSelectorHasText('h1.base--h2.use--header', 'Train a demo classifier');

  // dog breeds
  casper.then(function() {
    this.click('div._training--example:nth-child(1)');
  });

  // dog type examples
  casper.waitForSelector('div._examples[data-kind="dogs"]', function() {

  });

  casper.then(function() {
    this.click('img[data-name="goldenretriever"]');
  });

  // example shots
  casper.waitForSelector('div._examples--contact-sheet[data-kind="dogs"]', function() {

  });

  // click three of deez
  casper.then(function() {
    this.click('button._positive[data-name="goldenretriever"]');
  });
  casper.then(function() {
    this.click('button._positive[data-name="husky"]');
  });
  casper.then(function() {
    this.click('button._positive[data-name="dalmatian"]');
  });
  // TRAAAAIIIIIN!
  casper.then(function() {
    this.click('button.train--train-button');
  });

  // dogs test page
  casper.waitForSelector('h2.base--h2.test--classifier-name', function() {
    casper.test.assertSelectorHasText('h2.base--h2.test--classifier-name', 'Dogs');
  });

  // click on the cat
  casper.then(function() {
    this.click('label.test--example-thumb');
  });

  // el tigre no a dog
  casper.waitForSelector('h2.base--h2.test--output-header', function() {
    casper.test.assertSelectorHasText('h2.base--h2.test--output-header', 'Results');
  });
});

casper.run(function() {
  this.test.done();
});
