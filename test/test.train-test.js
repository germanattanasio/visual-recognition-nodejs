var system = require('system');
var apiKey = system.env.API_KEY;

casper.options.waitTimeout = 60000;

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

  casper.then(function() {
    casper.test.assertVisible('.train--loading', 'animation displayed during training');
  });

  casper.waitWhileVisible('.train--loading', function() {
    casper.test.assertTextExist('Test your newly trained demo classifier');

    // husky image by url
    // commenting for now because it sometimes gets marked as a dalmation (?)
    casper.then(function() {
      this.sendKeys('input.test--url-input', 'https://watson-test-resources.mybluemix.net/resources/husky.jpg');
      this.sendKeys('input.test--url-input', casper.page.event.key.Enter);
    });
    // casper.waitForResource('http://localhost:3000/api/classify');
    casper.waitUntilVisible('.test--loading');
    casper.waitWhileVisible('.test--loading');
    casper.waitUntilVisible('.results-table', function() {
      casper.test.assertSelectorHasText('.results-table--container:first-child tbody .base--tr:first-child .base--td:first-child', 'Husky');
    });

    // Dalmatian image by file upload
    casper.then(function() {
      this.fill('#test--fileupload', {
        'images_file': 'public/images/bundles/dogs/test/2.jpg'
      }, true);
    });
    casper.waitForResource('http://localhost:3000/api/classify');
    casper.waitUntilVisible('.results-table', function() {
      casper.test.assertSelectorHasText('.results-table--container:first-child tbody .base--tr:first-child .base--td:first-child', 'Dalmatian');
    });

    // click on the random picture link
    casper.then(function() {
      this.clickLabel('Use a system test image', 'a');
    });
    casper.then(function() {
      casper.test.assertVisible('.test--loading', 'animation displayed during image processing');
    });
    casper.waitWhileVisible('.test--loading');
    casper.then(function() {
      casper.test.assertVisible('.test--output', 'random image gets some output ');
      // can't really validate much more for a random image
    });
  }, null, 3 * 60 * 1000);
});

casper.run(function() {
  this.test.done();
});
