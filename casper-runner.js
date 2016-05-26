'use strict';

const spawn = require('child_process').spawn;

require('dotenv').config({silent: true});

if (process.env.GOOGLE_ANALYTICS) {
  process.env.GOOGLE_ANALYTICS = process.env.GOOGLE_ANALYTICS.replace(/\"/g, '');
}
if (process.env.API_KEY) {
  process.env.API_KEY = process.env.API_KEY.replace(/\"/g, '');
}

// Deployment tracking
require('cf-deployment-tracker-client').track();

var server = require('./app');
var port = process.env.PORT || process.env.VCAP_APP_PORT || 3000;

var toclose = server.listen(port, function() {
  console.log('Server running on port: %d', port);
});

const casper = spawn('npm', ['run', 'test-integration']);
casper.stdout.pipe(process.stdout);

casper.on('error', (error) => {
  console.log('ERROR: ' + error);
  toclose.close(function() {
    process.exit(1);
  });
});

casper.on('close', (code) => {
  toclose.close(function() {
    // eslint-disable-next-line no-process-exit
    process.exit(code);
  });
});
