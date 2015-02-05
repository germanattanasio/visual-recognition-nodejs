/**
 * Copyright 2014 IBM Corp. All Rights Reserved.
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

var express = require('express'),
  app = express(),
  request = require('request'),
  path = require('path'),
  bluemix = require('./config/bluemix'),
  validator = require('validator'),
  VisualRecognition = require('./visual-recognition'),
  extend = require('util')._extend,
  fs = require('fs');

// Bootstrap application settings
require('./config/express')(app);

// if bluemix credentials exists, then override local
var credentials = extend({
  url: '<url>',
  username: '<username>',
  password: '<password>'
}, bluemix.getServiceCreds('visual_recognition')); // VCAP_SERVICES

// Create the service wrapper
var visualRecognition = new VisualRecognition(credentials);

// render index page
app.get('/', function(req, res) {
  res.render('index');
});

app.post('/', function(req, res) {

  // Classifiers are 0 = all or a json = {label_groups:['<classifier-name>']}
  var classifier = req.body.classifier || '0';  // All
  if (classifier !== '0') {
    classifier = JSON.stringify({label_groups:[classifier]});
  }

  var imgFile;

  if (req.files.image) {
    // file image
    imgFile = fs.createReadStream(req.files.image.path);
  } else if(req.body.url && validator.isURL(req.body.url)) {
    // web image
    imgFile = request(req.body.url.split('?')[0]);
  } else if (req.body.url && req.body.url.indexOf('images') === 0) {
    // local image
    imgFile = fs.createReadStream(path.join('public',req.body.url));
  } else {
    // malformed url
    return res.status(500).json({ error: 'Malformed URL' });
  }

  var formData = {
    labels_to_check: classifier,
    imgFile: imgFile
  };

  visualRecognition.recognize(formData, function(err, result) {
    if (err)
      return res.status(500).json({ error: err });
    else {
      return res.json(result);
    }
  });
});

var port = process.env.VCAP_APP_PORT || 3000;
app.listen(port);
console.log('listening at:', port);