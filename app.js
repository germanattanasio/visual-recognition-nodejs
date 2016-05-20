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
var util = require('util');
var path = require('path');
var async = require('async');
var validator = require('validator');
var datasets = require('./public/data/datasets.json').datasets;
var zipUtils = require('./config/zip-utils');
var watson = require('watson-developer-cloud');


var ONE_HOUR = 3600000;

// Bootstrap application settings
require('./config/express')(app);

// Create the service wrapper
var visualRecognition = watson.visual_recognition({
  version: 'v3',
  api_key: '<api-key>',
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
  res.render('test', {
    datasets: datasets,
    ct: req._csrfToken,
    ga: process.env.GOOGLE_ANALYTICS
  });
});

/**
 * Creates a classifier
 * @param req.body.positives Array of base64 or relative images
 * @param req.body.nevatives Array of base64 or relative images
 * @param req.body.name classifier name
 */
app.post('/api/classifiers', function(req, res, next) {
  console.log(req.body.positives);
  // check the inputs
  if (!util.isArray(req.body.positives)) {
    return next({error: 'Missing positives images', code: 400});
  } else if (!util.isArray(req.body.negatives)) {
    return next({error: 'Missing negatives images', code: 400});
  } else if (!util.isString(req.body.name)) {
    return next({error: 'Missing classifier name', code: 400});
  } else if (req.body.positives.length < 10) {
    return next({error: 'Minimum positives images (10) sent:' +
     req.body.positives.length, code: 400});
  } else if (req.body.negatives.length < 10) {
    return next({error: 'Minimum negatives images (10) sent:' +
      req.body.negatives.length, code: 400});
  }

  console.time('training');

  async.parallel([
    zipUtils.zipImages.bind(null, req.body.positives), // zip positive images
    zipUtils.zipImages.bind(null, req.body.negatives)  // zip negative images
  ], function(zipError, zips) {
    if (zipError) {
      return next(zipError);
    }

    var trainingData = {
      positive_examples: fs.createReadStream(zips[0]),
      negative_examples: fs.createReadStream(zips[1]),
      name: req.body.name
    };

    visualRecognition.createClassifier(trainingData, function createClassifier(err, classifier) {
      console.timeEnd('training');
      console.log('deleting positive images:', trainingData.positive_examples.path);
      fs.unlink(trainingData.positive_examples.path);
      console.log('deleting negative images:', trainingData.negative_examples.path);
      fs.unlink(trainingData.negative_examples.path);

      if (err || !classifier) {
        return next(err);
      }
      // deletes the classifier after an hour
      setTimeout(visualRecognition.deleteClassifier.bind(visualRecognition, classifier), ONE_HOUR);
      res.json(classifier);
    });
  });
});

/**
 * Classifies an image
 * @param req.body.url The URL for an image either.
 *                     images/test.jpg or https://example.com/test.jpg
 */
app.post('/api/classify', app.upload.single('images_file'), function(req, res, next) {
  var params = {
    file: null
  };

  if (req.file) { // file image
    params.file = fs.createReadStream(req.file.path);
  } else if (req.body.url && req.body.url.indexOf('images') === 0) { // local image
    params.file = fs.createReadStream(path.join('public', req.body.url));
  } else if (req.body.url && validator.isURL(req.body.url)) { // url
    params.url = req.body.url.split('?')[0];
  } else { // malformed url
    return next({ error: 'Malformed URL', code: 400 });
  }

  async.parallel(['classify', 'detectFaces', 'recognizeText'].map(function(method) {
    return visualRecognition[method].bind(null, params);
  }), function(err, results) {
    if (req.file) { // delete the recognized file
      fs.unlink(params.file.path);
    }
    if (err) {
      return next(err);
    }
    res.json(results);
  });
});

// error-handler settings
require('./config/error-handler')(app);

module.exports = app;
