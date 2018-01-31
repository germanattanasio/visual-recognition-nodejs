/**
 * Copyright 2015 IBM Corp. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

// Module dependencies
var express = require('express');
var bodyParser = require('body-parser');
var multer = require('multer');
var path = require('path');
var cookieParser = require('cookie-parser');
var morgan = require('morgan');
var compression = require('compression');
var expressBrowserify = require('express-browserify');
var os = require('os');

module.exports = function(app) {
  // Configure Express
  app.set('view engine', 'jade');

  app.use(require('express-status-monitor')());
  app.use(compression({filter: function (req, res) {

    // This is kind of dumb, but I've had a few people reporting errors like
    // net::ERR_INCOMPLETE_CHUNKED_ENCODING.
    // Without compression, the content-length is known and so chucked encoding isn't used.
    // So, perhaps this will fix things.
    if (req.path == '/js/bundle.js') {
      return false
    }

    // fallback to standard filter function
    return compression.filter(req, res)
  }}));

  app.use(cookieParser());
  if (app.get('env') === 'development') {
    // set up request logging for local development and non-IBM Cloud servers
    // (IBM Cloud's router automatically logs all requests there)
    app.use(morgan('dev'));
  }
  app.use(bodyParser.urlencoded({
    extended: true,
    limit: '40mb'
  }));
  app.use(bodyParser.json({
    limit: '40mb'
  }));

  // automatically bundle the front-end js on the fly
  // note: this should come before the express.static since bundle.js is in the public folder
  var isDev = (app.get('env') === 'development');
  var browserifyier = expressBrowserify('./public/js/bundle.js', {
    watch: isDev,
    debug: isDev,
    extension: [ 'jsx' ],
    transform:  [["babelify", { "presets": ["es2015", "react"] }]]
  });
  if (!isDev) {
    browserifyier.browserify.transform('uglifyify', {global:true})
  }
  app.get('/js/bundle.js', browserifyier);

  // Setup static public directory
  app.use(express.static(path.join(__dirname, '..', 'public')));

  // Setup the upload mechanism
  var storage = multer.diskStorage({
    destination: function(req, file, cb) {
      cb(null, os.tmpdir());
    },
    filename: function(req, file, cb) {
      cb(null, Date.now() + '-' + file.originalname);
    }
  });

  var upload = multer({
    storage: storage
  });
  app.upload = upload;

  // When running in IBM Cloud add rate-limitation
  // and some other features around security
  if (process.env.VCAP_APPLICATION) {
    require('./security')(app);
  }
};
