var system = require('system')
var api_key = system.env.API_KEY;

casper.options.waitTimeout = 20000;

casper.start();

casper.thenBypassUnless(function() {
  return api_key && api_key.length > 0;
},4);

casper.thenOpen('http://localhost:3000', function(result) {
  casper.test.assert(result.status === 200, 'Front page opens');
  casper.test.assertSelectorHasText('h2.base--h2.use--header', 'Try the service');

  // whoopi
  casper.then(function() {
    this.click('#use--image0_default');
  });

  // class stuff
  casper.waitForSelector('table.classes-table h3.base--h3', function() {
    casper.test.assertSelectorHasText('table.classes-table h3.base--h3', 'Classes');
    casper.test.assertSelectorHasText('table.classes-table tbody .base--tr:first-child .base--td:first-child', 'person');
    casper.test.assertSelectorHasText('table.classes-table tbody .base--tr:last-child .base--td', 'Type Hierarchy: /people');
  });

  // face stuff
  casper.waitForSelector('table.faces-table h3.base--h3', function() {
    casper.test.assertSelectorHasText('table.faces-table h3.base--h3', 'Faces');
    casper.test.assertSelectorHasText('table.faces-table tbody .base--tr:nth-child(1) .base--td:first-child', 'Estimated age: 55 - 64');
    casper.test.assertSelectorHasText('table.faces-table tbody .base--tr:nth-child(2) .base--td:first-child', 'Gender: female');
    casper.test.assertSelectorHasText('table.faces-table tbody .base--tr:nth-child(3) .base--td:first-child', 'Identity: Whoopi Goldberg');
    casper.test.assertSelectorHasText('table.faces-table tbody .base--tr:nth-child(4) .base--td:first-child', 'Type Hierarchy: people > women > celebrities > whoopi goldberg');
  });

  // lego
  casper.then(function() {
    this.click('#use--image1_default');
  });
  // word stuff
  casper.waitForSelector('table.words-table h3.base--h3', function() {
    casper.test.assertSelectorHasText('table.words-table h3.base--h3', 'Words');
    casper.test.assertSelectorHasText('table.words-table tbody .base--tr:first-child .base--td:first-child', 'lego');
  });
});


casper.thenOpen('http://localhost:3000/',function() {
  // google logo
  casper.then(function() {
    this.sendKeys('input.use--url-input', 'https://visual-recognition-demo.mybluemix.net/images/samples/3.jpg');
    this.sendKeys('input.use--url-input', casper.page.event.key.Enter);
  });
  casper.waitForSelector('table.classes-table h3.base--h3', function() {
    casper.test.assertSelectorHasText('table.classes-table h3.base--h3', 'Classes');
    casper.test.assertSelectorHasText('table.classes-table tbody .base--tr:first-child .base--td:first-child', 'people');
    casper.test.assertSelectorHasText('table.classes-table tbody .base--tr:last-child .base--td', 'Type Hierarchy: /people');


    casper.test.assertSelectorHasText('table.faces-table h3.base--h3', 'Faces');
    casper.test.assertSelectorHasText('table.faces-table tbody .base--tr:nth-child(1) .base--td:first-child', 'Estimated age: 25 - 34');
    casper.test.assertSelectorHasText('table.faces-table tbody .base--tr:nth-child(2) .base--td:first-child', 'Gender: female');
    casper.test.assertSelectorHasText('table.faces-table tbody .base--tr:nth-child(3) .base--td:first-child', 'Estimated age: 18 - 24');
    casper.test.assertSelectorHasText('table.faces-table tbody .base--tr:nth-child(4) .base--td:first-child', 'Gender: female');
  });
});

casper.run(function() {
  this.test.done();
});
