'use strict';

var spawn = require('child_process').spawn;

require('dotenv').config({silent: true});

if (process.env.GOOGLE_ANALYTICS) {
  process.env.GOOGLE_ANALYTICS = process.env.GOOGLE_ANALYTICS.replace(/\"/g, '');
}
if (process.env.API_KEY) {
  process.env.API_KEY = process.env.API_KEY.replace(/\"/g, '');
}


var server = require('./app');
var port = process.env.PORT || process.env.VCAP_APP_PORT || 3000;

var toclose = server.listen(port, function() {
  console.log('Server running on port: %d', port);
  setTimeout(runTests, 10000);
});

var runTests = function() {
  var casper = spawn('npm', ['run', 'test-integration']);
  casper.stdout.pipe(process.stdout);

  casper.on('error', function (error)  {
    console.log('ERROR: ' + error);
    toclose.close(function() {
      process.exit(1);
    });
  });

  casper.on('close', function (code) {
    toclose.close(function() {
      // eslint-disable-next-line no-process-exit
      process.exit(code);
    });
  });
};

