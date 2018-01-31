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

// security.js
var rateLimit = require('express-rate-limit');
var csrf = require('csurf');
var helmet = require('helmet');

module.exports = function(app) {
  app.enable('trust proxy');

  // 1. helmet with some customizations
  app.use(helmet({
    cacheControl: false,
    frameguard: false,
  }));

  // 2. rate-limit to /api/
  // app.use('/api/', rateLimit({
  //   windowMs: 30 * 1000, // seconds
  //   delayMs: 0,
  //   max: 10
  // }));

  // 3. csrf
  var csrfProtection = csrf({
    cookie: true
  });

  app.get('/*', csrfProtection, function(req, res, next) {
    res.locals = {
      ga: process.env.GOOGLE_ANALYTICS,
      ct: req.csrfToken()
    };
    next();
  });

};
