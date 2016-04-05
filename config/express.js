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
var express    = require('express'),
  bodyParser   = require('body-parser'),
  multer       = require('multer'),
  findRemoveSync = require('find-remove');

module.exports = function (app) {

  // When running in Bluemix add rate-limitation
  // and some other features around security
  if (process.env.VCAP_APPLICATION)
    require('./security')(app);


  // Configure Express
  app.set('view engine', 'jade');
  app.use(bodyParser.urlencoded({ extended: true, limit: '40mb' }));
  app.use(bodyParser.json({ limit: '40mb' }));

  // Setup static public directory
  app.use(express.static(__dirname + '/../public'));

  // Setup the upload mechanism
  var storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './uploads/');
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + '-' + file.originalname);
    }
  });

  var upload = multer({ storage: storage });
  app.upload = upload;
  // Remove files older than 1 hour every hour.
  setInterval(function() {
    var removed = findRemoveSync(__dirname + '/../uploads', {age: {seconds: 3600}});
    if (removed.length > 0)
      console.log('removed:', removed);
  }, 3600000);
};
