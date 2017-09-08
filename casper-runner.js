'use strict';

if (!process.env.VISUAL_RECOGNITION_API_KEY) {
  console.log('Skipping integration tests because VISUAL_RECOGNITION_API_KEY is null');
  process.exit(0);
}

var spawn = require('child_process').spawn;

require('dotenv').config({silent: true});

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

