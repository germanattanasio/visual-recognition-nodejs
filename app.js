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

var express = require('express');
var app = express();
var fs = require('fs');
var extend = require('extend');
var path = require('path');
var async = require('async');
var validator = require('validator');
var datasets = require('./public/data/datasets.json').datasets;
var zipUtils = require('./config/zip-utils');
var watson = require('watson-developer-cloud');
var uuid = require('uuid');
var detectedFaces = require('./data/faces');
var recognizedText = require('./data/text');
var classification = require('./data/classify');
var bundleUtils = require('./config/bundle-utils');

var ONE_HOUR = 3600000;

// Bootstrap application settings
require('./config/express')(app);

// Create the service wrapper
var visualRecognition = watson.visual_recognition({
  version: 'v3',
  api_key: process.env.API_KEY || '<api-key>',
  version_date: '2015-05-19'
});

app.get('/', function(req, res) {
  res.render('use', {
    datasets: datasets,
    ct: req._csrfToken,
    ga: process.env.GOOGLE_ANALYTICS
  });
});

app.get('/train', function(req, res) {
  res.render('train', {
    datasets: datasets,
    ct: req._csrfToken,
    ga: process.env.GOOGLE_ANALYTICS
  });
});

app.get('/test', function(req, res) {
  console.log('Cookies: ', req.cookies)

  res.render('test', {
    datasets: datasets,
    ct: req._csrfToken,
    ga: process.env.GOOGLE_ANALYTICS
  });
});

/**
 * Creates a classifier
 * @param req.body.bundles Array of selected bundles
 * @param req.body.kind The bundle kind
 */
app.post('/api/classifiers', function(req, res, next) {
  var params = {
    bundles: [  'goldenretriever', 'husky', 'dalmation', 'beagle', 'negatives'],
    kind: 'dogs'
  };

  var formData = bundleUtils.createFormData(params);
  visualRecognition.createClassifier(formData, function createClassifier(err, classifier) {
    if (err) {
      return next(err);
    }
    // deletes the classifier after an hour
    setTimeout(visualRecognition.deleteClassifier.bind(visualRecognition, classifier), ONE_HOUR);
    res.json(classifier);
  });
});

/**
 * Gets the status of a classifier
 * @param req.params.classifier_id The classifier id
 */
app.get('/api/classifiers/:classifier_id', function(req, res, next) {
  visualRecognition.getClassifier(req.params, function getClassifier(err, classifier) {
    if (err) {
      return next(err);
    }
    // deletes the classifier after an hour
    setTimeout(visualRecognition.deleteClassifier.bind(visualRecognition, classifier), ONE_HOUR);
    res.json(classifier);
  });});

app.get('/test/classify', function(req, res) {
  setTimeout(function() {
    res.json(extend(true, {}, detectedFaces, recognizedText, classification));
  }, req.query.s ? req.query.s * 1000 : 1000);
});


/**
 * Classifies an image
 * @param req.body.url The URL for an image either.
 *                     images/test.jpg or https://example.com/test.jpg
 * @param req.file The image file.
 */
app.post('/api/classify', app.upload.single('images_file'), function(req, res, next) {
  var params = {
    parameters: null,
    images_file: null
  };

  if (req.file) { // file image
    params.images_file = fs.createReadStream(req.file.path);
  } else if (req.body.url && req.body.url.indexOf('images') === 0) { // local image
    params.images_file = fs.createReadStream(path.join('public', req.body.url));
  } else if (req.body.image_data) {  // write the base64 image to a temp file
    var resource = zipUtils.parseBase64Image(req.body.image_data);
    var temp = path.join(__dirname, 'uploads', uuid.v1() + '.' + resource.type);
    fs.writeFileSync(temp, resource.data);
    params.images_file = fs.createReadStream(temp);
  } else if (req.body.url && validator.isURL(req.body.url)) { // url
    params.parameters = JSON.stringify({url: req.body.url.split('?')[0]});
  } else { // malformed url
    return next({ error: 'Malformed URL', code: 400 });
  }

  if (params.images_file) {
    delete params.parameters;
  } else {
    delete params.images_file;
  }

  async.parallel(['classify', 'detectFaces', 'recognizeText'].map(function(method) {
    return async.reflect(visualRecognition[method].bind(visualRecognition, params));
  }), function(err, results) {
    if (req.file) { // delete the recognized file
      fs.unlink(req.file.path.path);
    }
    if (err) {
      return next(err);
    }
    var combine = results.reduce(function(prev, cur) {
      return extend(true, prev, cur);
    });
    if (combine.value) {
      res.json(combine.value[0]);
    } else {
      console.log('result:', combine);
      res.status(400).json(combine.error);
    }
  });
});

// error-handler settings
require('./config/error-handler')(app);

module.exports = app;
