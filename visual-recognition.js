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

var request = require('request');

/**
 * Check if the service/request have error and try to format them.
 * @param  {Function} cb the request callback
 */
function formatErrorIfExists(cb) {
  return function(error, response, body) {

    // If we have an error return it.
    if (error) {
      cb(error, body, response);
      return;
    }

    try {
      body = JSON.parse(body);
    } catch (e) {}

    // If we have a response and it contains an error
    if (body && (body.error || body.error_code)) {
      error = body;
      body = null;
    }

    // If we still don't have an error and there was an error...
    if (!error && (response.statusCode < 200 || response.statusCode >= 300)) {
      error = { code: response.statusCode, error: body };
      if (error.code === 401 || error.code === 403)
        error.error= 'Unauthorized: Access is denied due to invalid credentials';
      body = null;
    }
    cb(error, body, response);
  };
}

/**
 * Visual Recognition API Wrapper
 *
 * @param {[type]} options the context where 'auth' and 'url' are
 */
function VisualRecognition(options) {
  this._options = options || {};
  this.url = options.url.replace(/\/$/, '');
  this.auth = 'Basic ' + new Buffer(options.username + ':' + options.password).toString('base64');
}

/**
 * Provides a list of the labels and label_groups
 * which are available for use with the recognize method
 *
 */
VisualRecognition.prototype.labels = function(params, callback) {
  var options = {
    method: 'GET',
    url: this.url + '/v1/tag/labels',
    formData: params,
    headers: { 'Authorization': this.auth }
  };

  return request(options, formatErrorIfExists(callback));
};

/**
 * For the uploaded image, compute the score for each label selected
 *
 */
VisualRecognition.prototype.recognize = function(params, callback) {
  var options = {
    method: 'POST',
    url: this.url + '/v1/tag/recognize',
    formData: params,
    json: true,
    headers: { 'Authorization': this.auth }
  };
  return request(options, formatErrorIfExists(callback));
};

module.exports = VisualRecognition;