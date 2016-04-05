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

try {
  var env = require('./.env.js');
  console.log('loading .env.js');
  for (var key in env) {
    if (!(key in process.env))
      process.env[key] = env[key];
  }
} catch(ex) {
  console.log('.env.js not found');
}

var express = require('express'),
  app = express(),
  fs = require('fs'),
  util = require('util'),
  path = require('path'),
  async = require('async'),
  validator = require('validator'),
  request = require('request'),
  datasets = require('./public/data/datasets.json').datasets,
  zipUtils = require('./config/zip-utils'),
  uuid      = require('uuid'),
  watson = require('watson-developer-cloud');


var ONE_HOUR = 3600000;

// Bootstrap application settings
require('./config/express')(app);

// Create the service wrapper
var visualRecognition = watson.visual_recognition({
  version: 'v2-beta',
  username: '<username>',
  password: '<password>',
  version_date:'2015-12-02'
});

var alchemyVision = watson.alchemy_vision({
  api_key: process.env.ALCHEMY_KEY || '<alchemy-key>'
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
 * Filter users created classifier from 'result'. If 'classifier_ids' is specified
 * they won't be filtered
 * @param  {Object} result        The result of calling 'classify()'
 * @param  {Array} classifier_ids The user created classifier ids
 * @return {Object}               The filtered 'result'
 */
function filterUserCreatedClassifier(result, classifier_ids) {
  var ids = classifier_ids || [];
  if (result && result.images) {
    result.images.forEach(function(image) {
      if (util.isArray(image.scores))
        image.scores = image.scores.filter(function (score) {
          // IBM's classifiers have the id = name
          return (score.classifier_id === score.name) ||
                 (ids.indexOf(score.classifier_id) !== -1);
        });
    });
  }
  return result;
}

/**
 * Normalize Alchemy Vision results
 * @param  {Object} Alchemy vision result
 * @return {Object} Visual Recognition result
 */
function normalizeResult(item) {
  var result = {
    name: item.text || 'Unknown',
    score: parseFloat(item.score || '0')
  };
  return result;
}

function noTags(tag) {
  return tag.name !== 'NO_TAGS';
}
/**
 * Formats Alchemy Vision results to match the Watson Vision format
 * @param  {Object} result        The result of calling 'classify()'
 * @return {Object}               The formatted 'result'
 */
function formatAlchemyVisionResults(results) {
  return {
    images: [{
      scores: results.imageKeywords.map(normalizeResult).filter(noTags)
    }]
  };
}

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
  } else if (req.body.positives.length < 10){
    return next({error: 'Minimum positives images (10) sent:' +
     req.body.positives.length, code: 400});
  } else if (req.body.negatives.length < 10){
     return next({error: 'Minimum negatives images (10) sent:' +
      req.body.negatives.length, code: 400});
   }


  console.time('training');

  async.parallel([
    zipUtils.zipImages.bind(null,req.body.positives), // zip positive images
    zipUtils.zipImages.bind(null,req.body.negatives)  // zip negative images
  ],function(err, zips){
    if (err)
      return next(err);
    else {
      var trainingData = {
        positive_examples: fs.createReadStream(zips[0]),
        negative_examples: fs.createReadStream(zips[1]),
        name: req.body.name
      };

      visualRecognition.createClassifier(trainingData, function(err, classifier) {
        console.timeEnd('training');

        console.log('deleting positive images:', trainingData.positive_examples.path);
        fs.unlink(trainingData.positive_examples.path);
        console.log('deleting negative images:', trainingData.negative_examples.path);
        fs.unlink(trainingData.negative_examples.path);

        if (err || !classifier){
          return next(err);
        } else {
          // deletes the classifier after an hour
          setTimeout(
            visualRecognition.deleteClassifier.bind(visualRecognition, classifier),
            ONE_HOUR);
          res.json(classifier);
        }
      });
    }
  });
});

/**
 * Classifies an image
 * @param req.body.url The URL for an image either.
 *                     images/test.jpg or https://example.com/test.jpg
 */
app.post('/api/classify', app.upload.single('images_file'), function(req, res, next) {

  function requestWatsonApis(url) {
    if (req.query.classifier_id) {
      var vparams = {
        images_file: file,
        classifier_ids: [req.query.classifier_id]
      };

      visualRecognition.classify(vparams, function(err, results) {
        if (req.file || req.body.image_data) // delete the recognized file
          fs.unlink(file.path);

        if (err)
          return next(err);
        else
          res.json(filterUserCreatedClassifier(results, vparams.classifier_ids));
      });
    } else {
      var aparams = {
        image: file
      };

      if (url)
        aparams = { url: url };
      alchemyVision.getImageKeywords(aparams, function (err, results) {
        // delete the recognized file
        if (req.file || req.body.image_data)
          fs.unlink(file.path);

        if (err)
          return next(err);
        else
          res.json(formatAlchemyVisionResults(results));
      });
    }
  }

  var file = null;

  if (req.file) {
    // file image
    file = fs.createReadStream(req.file.path);
    requestWatsonApis();
  } else if (req.body.image_data) {
    // write the base64 image to a temp file
    var resource = zipUtils.parseBase64Image(req.body.image_data);
    var temp = './uploads/' + uuid.v1() + '.' + resource.type;
    fs.writeFileSync(temp, resource.data);
    file = fs.createReadStream(temp);
    requestWatsonApis();
  } else if (req.body.url && validator.isURL(req.body.url)) {
    // web image
    file = request(req.body.url.split('?')[0]);
    var url = req.body.url.split('?')[0];
    requestWatsonApis(url);
  } else if (req.body.url && req.body.url.indexOf('images') === 0) {
    // local image
    file = fs.createReadStream(path.join('public', req.body.url));
    requestWatsonApis();
  } else {
    // malformed url
    return next({ error: 'Malformed URL', code: 400 });
    requestWatsonApis();
  }

});

// error-handler settings
require('./config/error-handler')(app);

module.exports = app;
