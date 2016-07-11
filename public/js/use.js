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
/* global _:true */
/* eslint no-unused-vars: "warn"*/
'use strict';

var resize = require('./demo.js').resize;
var scrollToElement = require('./demo.js').scrollToElement;
var getAndParseCookieName = require('./demo.js').getAndParseCookieName;
var getRandomInt = require('./demo.js').getRandomInt;
var { renderBoxes } = require('./image-boxes.jsx');
var jpath = require('jpath-query');

var errorMessages = {
  ERROR_PROCESSING_REQUEST: 'Oops! The system encoutered an error. Try again.',
  LIMIT_FILE_SIZE: 'Ensure the uploaded image is under 2mb',
  URL_FETCH_PROBLEM: 'This is an invalid image URL.',
  TOO_MANY_REQUESTS: 'You have entered too many requests at once. Please try again later.',
  SITE_IS_DOWN: 'We are working to get Visual Recognition up and running shortly!'
};

var lockState = {};

function lock(lockName) {
  if (lockState[lockName] === 1) {
    return false;
  } else {
    lockState[lockName] = 1;
    return true;
  }
}

function unlock(lockName) {
  lockState[lockName] = 0;
}

/*
 * Setups the "Try Out" and "Test" panels.
 * It connects listeners to the DOM elements in the panel to allow
 * users to select an existing image or upload a file.
 * @param params.panel {String} The panel name that will be use to locate the DOM elements.
 */

function setupUse(params) {
  var panel = params.panel || 'use';
  console.log('setupUse()', panel);

  // panel ids
  var pclass = '.' + panel + '--';
  var pid = '#' + panel + '--';

  // jquery elements we are using
  var $loading = $(pclass + 'loading');
  var $result = $(pclass + 'output');
  var $error = $(pclass + 'error');
  var $errorMsg = $(pclass + 'error-message');
  var $tbody = $(pclass + 'output-tbody');
  var $image = $(pclass + 'output-image');
  var $urlInput = $(pclass + 'url-input');
  var $imageDataInput = $(pclass + 'image-data-input');
  var $radioImages = $(pclass + 'example-radio');
  var $invalidImageUrl = $(pclass + 'invalid-image-url').hide();
  var $invalidUrl = $(pclass + 'invalid-url').show();
  var $dropzone = $(pclass + 'dropzone');
  var $fileupload = $(pid + 'fileupload');
  var $outputData = $(pclass + 'output-data');
  var $boxes = $('.boxes');
  var $randomImage = $(pclass + 'random-test-image');

  /*
   * Resets the panel
   */
  function reset() {
    $loading.hide();
    $result.hide();
    $error.hide();
    resetPasteUrl();
    $urlInput.val('');
    $tbody.empty();
    $outputData.empty();
    $('.dragover').removeClass('dragover');
    $boxes.empty();
  }

  // init reset
  reset();

  function processImage() {
    reset();
    $loading.show();
    scrollToElement($loading);
  }

  /*
   * Shows the result from classifing an image
   */
  function showResult(results) {
    $loading.hide();
    $error.hide();

    if (!results || !results.images || !results.images[0]) {
      showError(errorMessages.ERROR_PROCESSING_REQUEST);
      return;
    }

    if (results.images[0].error) {
      var error = results.images[0].error;
      if (error.description && error.description.indexOf('Individual size limit exceeded') === 0) {
        showError(errorMessages.LIMIT_FILE_SIZE);
        return;
      } else if (results.images[0].error.error_id === 'input_error') {
        showError(errorMessages.URL_FETCH_PROBLEM);
        return;
      }
    }

    // populate table
    renderTable(results);
    $result.show();

    setTimeout(function() {
      renderEntities(results);
    }, 100);
    $(window).resize(function() {
      $boxes.empty();
      renderEntities(results);
    });

    // check if there are results or not
    if ($outputData.html() === '') {
      $outputData.after(
        $('<div class="' + panel + '--mismatch" />')
        .html('No matching classifiers found.'));
    }

    var outputImage = document.querySelector('.use--output-image');
    if (outputImage && (outputImage.height >= outputImage.width)) {
      $(outputImage).addClass('landscape');
    }
    scrollToElement($result);
  }

  function showError(message) {
    $error.show();
    $errorMsg.html(message);
    console.log($error, $errorMsg);
  }

  function _error(xhr, responseMessage) {
    $loading.hide();
    var message = responseMessage || 'Error classifying the image';
    if (xhr && xhr.responseJSON) {
      message = xhr.responseJSON.error;
    }
    showError(message);
  }

  /*
   * submit event
   */
  function classifyImage(imgPath, imageData, beforeFunction, afterFunction) {
    if (!lock('classify')) {
      return;
    }

    beforeFunction ? beforeFunction() : false;

    processImage();
    if (imgPath !== '') {
      $image.attr('src', imgPath);
      $urlInput.val(imgPath);
    }

    $imageDataInput.val(imageData);

    // Grab all form data
    $.post('/api/classify', $(pclass + 'form').serialize())
      .done(showResult)
      .error(function(error) {
        $loading.hide();
        console.log(error);

        if (error.status === 429) {
          showError(errorMessages.TOO_MANY_REQUESTS);
        } else if (error.responseJSON && error.responseJSON.error) {
          showError('We had a problem classifying that image because ' + error.responseJSON.error);
        } else {
          showError(errorMessages.SITE_IS_DOWN);
        }
      }).always(function() {
        afterFunction ? afterFunction() : false;
        unlock('classify');
      });
  }

  /*
   * Prevent default form submission
   */
  $fileupload.submit(false);

  /*
   * Radio image submission
   */
  $radioImages.click(function() {
    var rI = $(this);
    var imgPath = rI.next('label').find('img').attr('src');
    $urlInput.hide();
    classifyImage(imgPath, null, function() {
      $('input[type=radio][name=use--example-images]').prop('disabled', true);
      resetPasteUrl();
      rI.parent().find('label').addClass('dim');
      rI.parent().find('label[for=' + rI.attr('id') + ']').removeClass('dim');
    }, function() {
      $urlInput.val('');
      $urlInput.show();
      $('input[type=radio][name=use--example-images]').prop('disabled', false);
    });
  });

  /*
   * Random image submission
   */
  $randomImage.click(function() {
    resetPasteUrl();
    var bundle = getAndParseCookieName('bundle');
    var kind = bundle ? bundle.kind : 'user'; 
    var path = kind === 'user' ? '/samples/' : '/bundles/' + kind + '/test/';
    classifyImage('images' + path +  getRandomInt(1, 5) + '.jpg');
    $urlInput.val('');
  });

  /*
   * Image url submission
   */
  $urlInput.keypress(function(e) {
    var url = $(this).val();
    var self = $(this);

    if (e.keyCode === 13) {
      $invalidUrl.hide();
      $invalidImageUrl.hide();
      resetPasteUrl();
      classifyImage(url);
      self.blur();
    }

    $(self).focus();
  });

  function resetPasteUrl() {
    $urlInput.removeClass(panel + '--url-input_error');
    $invalidUrl.hide();
    $invalidImageUrl.hide();
  }
  /**
   * Jquery file upload configuration
   * See details: https://github.com/blueimp/jQuery-File-Upload
   */
  $fileupload.fileupload({
    dataType: 'json',
    dropZone: $dropzone,
    acceptFileTypes: /(\.|\/)(gif|jpe?g|png)$/i,
    add: function(e, data) {
      data.url = '/api/classify';
      if (data.files && data.files[0]) {
        $error.hide();

        processImage();
        var reader = new FileReader();
        reader.onload = function() {
          var image = new Image();
          image.src = reader.result;
          image.onload = function() {
            $image.attr('src', this.src);
            classifyImage('', resize(image, 2048));
          };
          image.onerror = function() {
            _error(null, 'Error loading the image file. I can only work with images.');
          };
        };
        reader.readAsDataURL(data.files[0]);
      }
    },
    error: _error,
    done: function(e, data) {
      showResult(data.result);
    }
  });

  $(document).on('dragover', function() {
    $(pclass + 'dropzone label').addClass('dragover');
    $('form#use--fileupload').addClass('dragover');
  });

  $(document).on('dragleave', function() {
    $(pclass + 'dropzone label').removeClass('dragover');
    $('form#use--fileupload').removeClass('dragover');
  });

  function roundScore(score) {
    return Math.round(score * 100) / 100;
  }

  function slashesToArrows(typeHierarchy) {
    var results = typeHierarchy;
    results = results.replace(/^\/|\/$/g, ''); // trim first / and last /
    results = results.replace(/\//g, ' > ');  // change slashes to >'s
    return results;
  }

  function lookupInMap(mapToCheck, kind, token, defaultValue) {
    if (!mapToCheck) {
      return defaultValue;
    }

    var res = mapToCheck[kind] && mapToCheck[kind][token] ? mapToCheck[kind][token] : false;
    if (res) {
      return res;
    } else {
      return defaultValue;
    }
  }

  // need to add on resize event listener for faces
  // need to offset and position itself and scale properly with physical image location
  // need to calculate ratio of image
  // get ratio
  // get starting image position
  // get transformed positions of face
  //  = ratio * original positions + offset
  function renderEntities(results) {
    var faces = jpath.jpath('/images/0/faces',results,[]);
    var faceLocations = faces.map(function(face) {
        return transformBoxLocations(face.face_location, document.querySelector('.use--output-image'));
      });

    var words = jpath.jpath('/images/0/words',results,[]);
    var wordsLocations = words.map(function(word) {
        return transformBoxLocations(word.location, document.querySelector('.use--output-image'));
      });

    renderBoxes('box',wordsLocations.concat(faceLocations));
  }

  function transformBoxLocations(faceLocation, image) {
    var newFaceLocation = faceLocation;
    var ratio = image.getBoundingClientRect().width / image.naturalWidth;
    var coordinates = getCoords(image);
    newFaceLocation = {
      width: faceLocation.width * ratio,
      height: faceLocation.height * ratio,
      top: coordinates.top + faceLocation.top * ratio,
      left: coordinates.left + faceLocation.left * ratio
    };
    return newFaceLocation;
  }

  /*
   * Solution found here:
   * http://stackoverflow.com/questions/5598743/finding-elements-position-relative-to-the-document#answer-26230989
   */
  function getCoords(elem) { // crossbrowser version
    var box = elem.getBoundingClientRect();

    var body = document.body;
    var docEl = document.documentElement;

    var scrollTop = window.pageYOffset || docEl.scrollTop || body.scrollTop;
    var scrollLeft = window.pageXOffset || docEl.scrollLeft || body.scrollLeft;

    var clientTop = docEl.clientTop || body.clientTop || 0;
    var clientLeft = docEl.clientLeft || body.clientLeft || 0;

    var top  = box.top +  scrollTop - clientTop;
    var left = box.left + scrollLeft - clientLeft;

    return { top: Math.round(top), left: Math.round(left) };
  }

  function renderTable(results) {
    $('.' + panel + '--mismatch').remove();

    if (results.images && results.images.length > 0) {
      if (results.images[0].resolved_url) {
        $image.attr('src', results.images[0].resolved_url);
      }
    }

    // eslint-disable-next-line camelcase
    var useResultsTable_template = useResultsTableTemplate.innerHTML;

    var classNameMap = getAndParseCookieName('classNameMap', {});
    var bundle = getAndParseCookieName('bundle', {});

    // classes
    if ((results.images &&
      results.images[0].classifiers &&
      results.images[0].classifiers.length > 0 &&
      results.images[0].classifiers[0].classes !== 'undefined') &&
      results.images[0].classifiers[0].classes.length > 0) {
      var classesModel = (function() {
        var classes = results.images[0].classifiers[0].classes.map(function(item) {
          return {
            name: results.classifier_ids ? lookupInMap(classNameMap, bundle.kind, item.class, item.class) : item.class,
            score: roundScore(item.score),
            type_hierarchy: item.type_hierarchy ? slashesToArrows(item.type_hierarchy) : false
          };
        });

        return {
          resultCategory: 'Classes',
          classes_raw: results.raw.classify,
          data: classes
        };
      })();

      $outputData.append(_.template(useResultsTable_template, {
        items: classesModel
      }));
    } else if (results.classifier_ids) {
      var classes = bundle.names[0];
      if (bundle.names.length > 1) {
        classes = bundle.names.slice(0, -1).join(', ') + ' or ' + bundle.names.slice(-1);
      }
      $outputData.html('<div class="' + panel + '--mismatch">' +
          'The score for this image is not above the threshold of 0.5 for ' + (bundle.name || '' ) + ': ' + classes +
          ', based on the training data provided.</div>');
    }

    // faces
    if ((typeof results.images[0].faces !== 'undefined') && (results.images[0].faces.length > 0)) {
      var facesModel = (function() {
        var identities = [];
        var faces = results.images[0].faces.reduce(function(acc, facedat) {
          // gender
          acc.push({
            name: facedat.gender.gender.toLowerCase(),
            score: roundScore(facedat.gender.score)
          });

          // age
          acc.push({
            name: 'age ' + facedat.age.min + ' - ' + facedat.age.max,
            score: roundScore(facedat.age.score)
          });

          // identity
          if (typeof facedat.identity !== 'undefined') {
            identities.push({
              name: facedat.identity.name,
              score: roundScore(facedat.identity.score),
              type_hierarchy: facedat.identity.type_hierarchy ? slashesToArrows(facedat.identity.type_hierarchy) : false
            });
          }
          return acc;
        }, []);

        return {
          resultCategory: 'Faces',
          identities: identities,
          classes_raw: results.raw.detectFaces,
          data: faces
        };
      })();

      $outputData.append(_.template(useResultsTable_template, {
        items: facesModel
      }));
    }

    // words
    if ((typeof results.images[0].words !== 'undefined') && (results.images[0].words.length > 0)) {
      var wordsModel = (function() {
        var words = results.images[0].words.map(function(item) {
          return {
            name: item.word,
            score: roundScore(item.score)
          };
        });
        return {
          resultCategory: 'Words',
          classes_raw: results.raw.recognizeText,
          data: words
        };
      })();

      $outputData.append(_.template(useResultsTable_template, {
        items: wordsModel
      }));
    }

    $('a.json').on('click', function() {
      var rawJsonData = $(this).parent().find('.json_raw').data('raw');
      window.open('data:application/json,' + rawJsonData, '_blank');
    });

    $(document).on('click', '.results-table--input-no', function() {
      $(this).parent().hide();
      $(this).parent().parent().find('.results-table--feedback-thanks').show();
      $(this).parent().parent().addClass('results-table--feedback-wowed');
      var originalElement = $(this);
      setTimeout(function() {
        originalElement.parent().show();
        originalElement.parent().parent().find('.results-table--feedback-thanks').hide();
        originalElement.parent().parent().removeClass('results-table--feedback-wowed');
      }, 2000);
    });

    $(document).on('click', '.results-table--input-yes', function() {
      $(this).parent().hide();
      $(this).parent().parent().find('.results-table--feedback-thanks').show();
      $(this).parent().parent().addClass('results-table--feedback-wowed');
      var originalElement = $(this);
      setTimeout(function() {
        originalElement.parent().show();
        originalElement.parent().parent().find('.results-table--feedback-thanks').hide();
        originalElement.parent().parent().removeClass('results-table--feedback-wowed');
      }, 2000);
    });
  }
}

module.exports = setupUse;
