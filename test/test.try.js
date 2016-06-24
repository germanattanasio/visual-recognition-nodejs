var system = require('system');
var apiKey = system.env.API_KEY;

casper.options.waitTimeout = 20000;

casper.start();

casper.thenBypassUnless(function() {
  return apiKey && apiKey.length > 0;
}, 4);

casper.thenOpen('http://localhost:3000', function(result) {
  casper.test.assert(result.status === 200, 'Front page opens');
  casper.test.assertSelectorHasText('h2.base--h2.use--header', 'Try the service');

  testDemoImages();

  testPastedDemoImage();

  testUploadedImage();
});

function testDemoImages() {
  casper.thenOpen('http://localhost:3000', function() {
    // whoopi
    casper.then(function() {
      this.click('#use--image0_default');
    });
    // class stuff
    casper.waitForSelector('.results-table--container:first-child table.results-table th.base--th', function() {
      casper.test.assertSelectorHasText('.results-table--container:first-child table.results-table th.base--th', 'Classes');
      casper.test.assertSelectorHasText('.results-table--container:first-child table.results-table tbody .base--tr:first-child .base--td:first-child', 'person');
    });

    // face stuff
    casper.waitForSelector('.results-table--container:last-child table.results-table th.base--th', function() {
      casper.test.assertSelectorHasText('.results-table--container:last-child table.results-table th.base--th', 'Faces');
      casper.test.assertSelectorHasText('.results-table--container:last-child table.results-table tbody .base--tr:nth-child(1) .base--td:first-child', 'female');
      casper.test.assertSelectorHasText('.results-table--container:last-child table.results-table tbody .base--tr:nth-child(2) .base--td:first-child', 'age 55 - 64');
      casper.test.assertSelectorHasText('.results-table--container:last-child table.results-table tbody .base--tr:nth-child(5) .base--td:first-child', 'Whoopi Goldberg');
      casper.test.assertSelectorHasText('.results-table--container:last-child table.results-table tbody .base--tr:nth-child(6) .base--td:first-child', 'people > women > celebrities > whoopi goldberg');
    });
  });
  casper.thenOpen('http://localhost:3000', function() {
    // lego
    casper.then(function() {
      this.click('#use--image1_default');
    });
    // word stuff
    casper.waitForSelector('.results-table--container:first-child th.base--th', function() {
      casper.test.assertSelectorHasText('.results-table--container:first-child th.base--th', 'Classes');
      casper.test.assertSelectorHasText('.results-table--container:first-child tbody .base--tr:first-child .base--td:first-child', 'lego');

      casper.test.assertSelectorHasText('.results-table--container:nth-child(2) thead th.base--th', 'Faces');
      casper.test.assertSelectorHasText('.results-table--container:nth-child(2) tbody .base--tr:nth-child(1) .base--td:first-child', 'male');
      casper.test.assertSelectorHasText('.results-table--container:nth-child(2) tbody .base--tr:nth-child(2) .base--td:first-child', 'age 18 - 24');

      casper.test.assertSelectorHasText('.results-table--container:last-child thead th.base--th', 'Words');
      casper.test.assertSelectorHasText('.results-table--container:last-child tbody .base--tr:first-child .base--td:first-child', 'lego');
    });
  });
  casper.thenOpen('http://localhost:3000', function() {
    // ladies
    casper.then(function() {
      this.click('#use--image2_default');
    });
    casper.waitForSelector('.results-table--container:first-child th.base--th', function() {
      casper.test.assertSelectorHasText('.results-table--container:first-child th.base--th', 'Classes');
      casper.test.assertSelectorHasText('.results-table--container:first-child tbody .base--tr:first-child .base--td:first-child', 'people');

      casper.test.assertSelectorHasText('.results-table--container:last-child th.base--th', 'Faces');
      casper.test.assertSelectorHasText('.results-table--container:last-child tbody .base--tr:nth-child(1) .base--td:first-child', 'female');
      casper.test.assertSelectorHasText('.results-table--container:last-child tbody .base--tr:nth-child(2) .base--td:first-child', 'age 25 - 34');
      casper.test.assertSelectorHasText('.results-table--container:last-child tbody .base--tr:nth-child(3) .base--td:first-child', 'female');
      casper.test.assertSelectorHasText('.results-table--container:last-child tbody .base--tr:nth-child(4) .base--td:first-child', 'age 18 - 24');
    });
  });
  casper.thenOpen('http://localhost:3000', function() {
    // 6th Street Sign
    casper.then(function() {
      this.click('#use--image3_default');
    });
    casper.waitForSelector('.results-table--container:first-child th.base--th', function() {
      casper.test.assertSelectorHasText('.results-table--container:first-child th.base--th', 'Classes');
      casper.test.assertSelectorHasText('.results-table--container:first-child tbody .base--tr:first-child .base--td:first-child', 'sign');

      casper.test.assertSelectorHasText('.results-table--container:last-child thead th.base--th', 'Words');
      casper.test.assertSelectorHasText('.results-table--container:last-child tbody .base--tr:nth-child(1) .base--td:first-child', '66');
      casper.test.assertSelectorHasText('.results-table--container:last-child tbody .base--tr:nth-child(2) .base--td:first-child', 'th');
      casper.test.assertSelectorHasText('.results-table--container:last-child tbody .base--tr:nth-child(3) .base--td:first-child', 'st');
      casper.test.assertSelectorHasText('.results-table--container:last-child tbody .base--tr:nth-child(4) .base--td:first-child', 'lincoln');
      casper.test.assertSelectorHasText('.results-table--container:last-child tbody .base--tr:nth-child(5) .base--td:first-child', 'center');
    });
  });
}


function testPastedDemoImage() {
  casper.thenOpen('http://localhost:3000', function() {
    // pasted demo pic
    casper.then(function() {
      this.sendKeys('input.use--url-input', 'https://visual-recognition-demo.mybluemix.net/images/samples/3.jpg');
      this.sendKeys('input.use--url-input', casper.page.event.key.Enter);
    });
    casper.waitForSelector('.results-table--container:first-child thead th.base--th', function() {
      casper.test.assertSelectorHasText('.results-table--container:first-child thead th.base--th', 'Classes');
      casper.test.assertSelectorHasText('.results-table--container:first-child th.base--th', 'Classes');
      casper.test.assertSelectorHasText('.results-table--container:first-child tbody .base--tr:first-child .base--td:first-child', 'people');

      casper.test.assertSelectorHasText('.results-table--container:last-child th.base--th', 'Faces');
      casper.test.assertSelectorHasText('.results-table--container:last-child tbody .base--tr:nth-child(1) .base--td:first-child', 'female');
      casper.test.assertSelectorHasText('.results-table--container:last-child tbody .base--tr:nth-child(2) .base--td:first-child', 'age 25 - 34');
      casper.test.assertSelectorHasText('.results-table--container:last-child tbody .base--tr:nth-child(3) .base--td:first-child', 'female');
      casper.test.assertSelectorHasText('.results-table--container:last-child tbody .base--tr:nth-child(4) .base--td:first-child', 'age 18 - 24');
    });
  });
}

function testUploadedImage() {
  casper.thenOpen('http://localhost:3000', function() {
    // pasted demo pic
    this.fill('#use--fileupload', {
      'images_file': 'public/images/samples/1.jpg'
    }, true);
    // class stuff
    casper.waitForSelector('.results-table--container:first-child table.results-table th.base--th', function() {
      casper.test.assertSelectorHasText('.results-table--container:first-child table.results-table th.base--th', 'Classes');
      casper.test.assertSelectorHasText('.results-table--container:first-child table.results-table tbody .base--tr:first-child .base--td:first-child', 'person');
    });
    // face stuff
    casper.waitForSelector('.results-table--container:last-child table.results-table th.base--th', function() {
      casper.test.assertSelectorHasText('.results-table--container:last-child table.results-table th.base--th', 'Faces');
      casper.test.assertSelectorHasText('.results-table--container:last-child table.results-table tbody .base--tr:nth-child(1) .base--td:first-child', 'female');
      casper.test.assertSelectorHasText('.results-table--container:last-child table.results-table tbody .base--tr:nth-child(2) .base--td:first-child', 'age 55 - 64');
      casper.test.assertSelectorHasText('.results-table--container:last-child table.results-table tbody .base--tr:nth-child(5) .base--td:first-child', 'Whoopi Goldberg');
      casper.test.assertSelectorHasText('.results-table--container:last-child table.results-table tbody .base--tr:nth-child(6) .base--td:first-child', 'people > women > celebrities > whoopi goldberg');
    });
  });
}

casper.run(function() {
  this.test.done();
});
