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

var fs      = require('fs'),
  path      = require('path'),
  archiver  = require('archiver'),
  uuid      = require('uuid');

/**
 * Parse a base 64 image and return the extension and buffer
 * @param  {String} imageString The image data as base65 string
 * @return {Object}             { type: String, data: Buffer }
 */
function parseBase64Image(imageString) {
  var matches = imageString.match(/^data:image\/([A-Za-z-+\/]+);base64,(.+)$/),
    resource = {};

  if (matches.length !== 3) {
   return null;
  }

  resource.type = matches[1] === 'jpeg' ? 'jpg' : matches[1];
  resource.data = new Buffer(matches[2], 'base64');
  return resource;
}
module.exports.parseBase64Image = parseBase64Image;

/**
 * Archives an image uning the @param archive module
 * @param  {Object} archive The archiver module
 * @param  {String} image   The base64 or path to the image for bundles
 */
function archiveImage(archive, image) {
  if (image.indexOf('images/') === 0) {
    archive.append(fs.createReadStream('./public/' + image), {
      name: path.basename(image)
    });
  } else {
    var resource = parseBase64Image(image);
    if (resource !== null){
      archive.append(resource.data, {
        name: uuid.v1() + '.' + resource.type
      });
    } else {
      console.log('WARNING:', image, 'is not a base64 image');
    }
  }
}

/**
 * Creates a zip file with the images array
 * @param images The images to zip
 * @param  {Function} callback The callback
 */
module.exports.zipImages = function (images, callback) {
  try {
    var zipFile = path.join(__dirname, '../uploads/training-' + uuid.v1() + '.zip');

    var archive = archiver('zip');
    archive.on('error', callback);

    var output = fs.createWriteStream(zipFile);
    output.on('close', function(){
      callback(null, zipFile);
    });
    archive.pipe(output);
    images.forEach(archiveImage.bind(null, archive));

    archive.finalize();
  } catch (e) {
    callback(e);
  }
};
