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
var watson = require('watson-developer-cloud');
var uuid = require('uuid');
var bundleUtils = require('./config/bundle-utils');
var os = require('os');
var detectFaces = require('./modules/detect-faces')

var ONE_HOUR = 3600000;
var TWENTY_SECONDS = 20000;

// Bootstrap application settings
require('./config/express')(app);

// Create the service wrapper
// If no API Key is provided here, the watson-developer-cloud@2.x.x library will check for an VISUAL_RECOGNITION_API_KEY
// environment property and then fall back to the VCAP_SERVICES property provided by the IBM Cloud.
var visualRecognition = new watson.VisualRecognitionV3({
  // api_key: '<api-key>',
  version_date: '2015-05-19'
});

app.get('/', function(req, res) {
  res.render('use', {
    bluemixAnalytics: !!process.env.BLUEMIX_ANALYTICS,
  });
});

var scoreData = function(score) {
  var scoreColor;
  if (score >= 0.8) {
    scoreColor = '#b9e7c9';
  } else if (score >= 0.6) {
    scoreColor = '#f5d5bb';
  } else {
    scoreColor = '#f4bac0';
  }
  return { score: score, xloc: (score * 312.0), scoreColor: scoreColor};
};

app.get('/thermometer', function(req, res) {
  if (typeof req.query.score === 'undefined') {
    return res.status(400).json({ error: 'Missing required parameter: score', code: 400 });
  }
  var score = parseFloat(req.query.score);
  if (score >= 0.0 && score <= 1.0) {
    res.set('Content-type', 'image/svg+xml');
    res.render('thermometer', scoreData(score));
  } else {
    return res.status(400).json({ error: 'Score value invalid', code: 400 });
  }
});

app.get('/ready/:classifier_id', function(req, res) {
  visualRecognition.getClassifier(req.params, function getClassifier(err, classifier) {
    if (err) {
      console.log(err);
      return res.status(err.code || 500).json(err);
    }
    res.json(classifier);
  });
});

app.get('/train', function(req, res) {
  res.render('train', {
    bluemixAnalytics: !!process.env.BLUEMIX_ANALYTICS,
  });
});

app.get('/test', function(req, res) {
  res.render('test', {
    bundle: JSON.parse(req.cookies.bundle || '{}'),
    classifier: JSON.parse(req.cookies.classifier || '{}')
  });
});


function deleteUploadedFile(readStream) {
  fs.unlink(readStream.path, function(e) {
    if (e) {
      console.log('error deleting %s: %s', readStream.path, e);
    }
  });
}

/**
 * Creates a classifier
 * @param req.body.bundles Array of selected bundles
 * @param req.body.kind The bundle kind
 */
app.post('/api/classifiers', app.upload.fields([{ name: 'classupload', maxCount: 3 }, { name: 'negativeclassupload', maxCount: 1 }]), function(req, res) {
  var formData;

  if (!req.files) {
    formData = bundleUtils.createFormData(req.body);
  } else {
    formData = { name: req.body.classifiername };
    req.files.classupload.map(function(fileobj, idx) {
      formData[req.body.classname[idx] + '_positive_examples'] = fs.createReadStream(path.join(fileobj.destination, fileobj.filename));
    });

    if (req.files.negativeclassupload && req.files.negativeclassupload.length > 0) {
      var negpath = path.join(req.files.negativeclassupload[0].destination, req.files.negativeclassupload[0].filename);
      formData.negative_examples = fs.createReadStream(negpath);
    }
  }

  visualRecognition.createClassifier(formData, function createClassifier(err, classifier) {
    if (req.files) {
      req.files.classupload.map(deleteUploadedFile);
      if (req.files.negativeclassupload) {
        req.files.negativeclassupload.map(deleteUploadedFile);
      }
    }

    if (err) {
      console.log(err);
      return res.status(err.code || 500).json(err);
    }

    // ENV var prevents classifiers from being destroyed
    // for users who want that feature
    if (!process.env.PRESERVE_CLASSIFIERS) {
      // deletes the classifier after an hour
      setTimeout(visualRecognition.deleteClassifier.bind(visualRecognition, classifier), ONE_HOUR);
      res.json(classifier);
    }
  });
});

app.post('/api/retrain/:classifier_id', app.upload.any(), function(req, res) {
  let formData = { classifier_id: req.params.classifier_id };
  if (req.file) {
    if (req.file.fieldname.match(/^(negative_examples|.*_positive_examples)$/)) {
      formData[req.file.fieldname] = fs.createReadStream(req.file.path);
    }
  }
  let bodyKeys = Object.keys(req.body);

  bodyKeys.length && bodyKeys.reduce(function(store, item) {
    let pathToZip = path.join('./public/images/bundles', req.body[item]);
    try {
      fs.statSync(pathToZip);
      store[item] = fs.createReadStream(pathToZip);
    } catch (err) {
      console.log(pathToZip, " path not found");
    }
    return store;
  },formData);

  req.files && req.files.reduce(function (store, item) {
    if (item.fieldname.match(/^(negative_examples|.*_positive_examples)$/)) {
      store[item.fieldname] = fs.createReadStream(item.path);
    }
    return store;
  }, formData);

  visualRecognition.retrainClassifier(formData, function(err, classifier) {
    if (err) {
      console.log(err, Object.keys(formData),classifier);
    }
    Object.keys(formData).filter(function(item) { return item !== 'classifier_id'; }).map(function (item) {
      if (formData[item].path.match("public/images/bundles") === null) {
        fs.unlink(formData[item].path, function (e) {
          if (e) {
            console.log("Error removeing " + formData[item].path);
          }
        });
      }
    });
    if (err) {
      res.json(err)
    } else {
      res.json(classifier);
    }
  });
});

/**
 * Gets the status of a classifier
 * @param req.params.classifier_id The classifier id
 */
app.get('/api/classifiers/:classifier_id', function(req, res) {
  visualRecognition.getClassifier(req.params, function getClassifier(err, classifier) {
    if (err) {
      console.log(err);
      return res.status(err.code || 500).json(err);
    }
    res.json(classifier);
  });});

/**
 * Parse a base 64 image and return the extension and buffer
 * @param  {String} imageString The image data as base65 string
 * @return {Object}             { type: String, data: Buffer }
 */
function parseBase64Image(imageString) {
  var matches = imageString.match(/^data:image\/([A-Za-z-+/]+);base64,(.+)$/);
  var resource = {};

  if (matches.length !== 3) {
    return null;
  }

  resource.type = matches[1] === 'jpeg' ? 'jpg' : matches[1];
  resource.data = new Buffer(matches[2], 'base64');
  return resource;
}

/**
 * Classifies an image
 * @param req.body.url The URL for an image either.
 *                     images/test.jpg or https://example.com/test.jpg
 * @param req.file The image file.
 */
app.post('/api/classify', app.upload.single('images_file'), function(req, res) {
  var params = {
    url: null,
    images_file: null,
    owners: []
  };

  if (req.file) { // file image
    params.images_file = fs.createReadStream(req.file.path);
  } else if (req.body.url && req.body.url.indexOf('images') === 0) { // local image
    params.images_file = fs.createReadStream(path.join('public', req.body.url));
  } else if (req.body.image_data) {
    // write the base64 image to a temp file
    var resource = parseBase64Image(req.body.image_data);
    var temp = path.join(os.tmpdir(), uuid.v1() + '.' + resource.type);
    fs.writeFileSync(temp, resource.data);
    params.images_file = fs.createReadStream(temp);
  } else if (req.body.url) { // url
    params.url = req.body.url;
  } else { // malformed url
    return res.status(400).json({ error: 'Malformed URL', code: 400 });
  }

  if (params.images_file) {
    delete params.url;
  } else {
    delete params.images_file;
  }
  var methods = [];
  if (req.body.classifier_id || process.env.OVERRIDE_CLASSIFIER_ID) {
    params.classifier_ids = req.body.classifier_id ? [req.body.classifier_id] : [process.env.OVERRIDE_CLASSIFIER_ID];
    methods.push('classify');
  } else {
    params.classifier_ids = ['default', 'food'];
    params.threshold = 0.5; //So the classifers only show images with a confindence level of 0.5 or higher
    methods.push('classify');
    methods.push('detectFaces');
    methods.push('recognizeText');
  }

  // run the 3 classifiers asynchronously and combine the results
  async.parallel(methods.map(function(method) {
    var fn = visualRecognition[method].bind(visualRecognition, params);
    if (method === 'recognizeText') {
      return async.reflect(async.timeout(fn, TWENTY_SECONDS));
    } else if (method === 'detectFaces') {
      return async.reflect(async.timeout((callback) => {detectFaces.detectFaces(params, callback)}, TWENTY_SECONDS));
    } else {
      return async.reflect(fn);
    }
  }), function(err, results) {
    // delete the recognized file
    if (params.images_file && !req.body.url) {
      deleteUploadedFile(params.images_file);
    }

    if (err) {
      console.log(err);
      return res.status(err.code || 500).json(err);
    }
    // combine the results
    var combine = results.map(function(result) {
      if (result.value && result.value.length) {
        // value is an array of arguments passed to the callback (excluding the error).
        // In this case, it's the result and then the request object.
        // We only want the result.
        result.value = result.value[0];
      }
      return result;
    }).reduce(function(prev, cur) {
      return extend(true, prev, cur);
    });
    if (combine.value) {
      // save the classifier_id as part of the response
      if (req.body.classifier_id) {
        combine.value.classifier_ids = req.body.classifier_id;
      }
      combine.value.raw = {};
      methods.map(function(methodName, idx) {
        combine.value.raw[methodName] = encodeURIComponent(JSON.stringify(results[idx].value));
      });
      res.json(combine.value);
    } else {
      res.status(400).json(combine.error);
    }
  });
});

module.exports = app;
