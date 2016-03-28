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
var CLASSIFIER_ID = null;
/*global $:false, resize */

/**
 * Setups the "Try Out" and "Test" panels.
 * It connects listeners to the DOM elements in the panel to allow
 * users to select an existing image or upload a file.
 * @param params.panel The panel name that will be use to locate the DOM elements.
 * @param params.useClassifierId If true, the classify request with use the global
 *                                  variable CLASSIFIER_ID
 */
function setupUse(params) {
  var panel = params.panel || 'use';
  var useClassifierId = params.useClassifierId || 'false';

  console.log('setupUse()', panel);

  // panel ids
  var pclass = '.'+ panel + '--',
      pid = '#'+ panel + '--';


  // jquery elements we are using
  var $loading = $(pclass + 'loading'),
    $result = $(pclass + 'output'),
    $error = $(pclass + 'error'),
    $errorMsg = $(pclass + 'error-message'),
    $tbody = $(pclass + 'output-tbody'),
    $image = $(pclass + 'output-image'),
    $urlInput = $(pclass + 'url-input'),
    $imageDataInput = $(pclass + 'image-data-input'),
    $radioImages = $(pclass + 'example-radio'),
    $invalidImageUrl = $(pclass + 'invalid-image-url').hide(),
    $invalidUrl = $(pclass + 'invalid-url').show(),
    $dropzone = $(pclass + 'dropzone'),
    $fileupload = $(pid + 'fileupload');

  /**
   * Resets the panel
   */
  function reset() {
    $loading.hide();
    $result.hide();
    $error.hide();
    resetPasteUrl();
    $urlInput.val('');
    $tbody.empty();
    $dropzone.find('label').removeClass('dragover');
  }

  // init reset
  reset();

  function processImage() {
    reset();
    $loading.show();
    scrollToElement($loading);
  }

  /**
   * Shows the result from classifing an image
   */
  function showResult(results) {
    $loading.hide();
    $error.hide();

    if (!results || !results.images || !results.images[0]) {
      showError('Error processing the request, please try again later.');
      return;
    }

    var scores = results.images[0].scores;

    if (!scores || scores.length === 0) {
      var message = $('.test--classifier-name').length === 0 ?
        'The image could not be classified' :
        'This image is not a match for ' + $('.test--classifier-name').text();
      if ($('#test').hasClass('active'))
        message = 'Not a positive match for ' + $('.test--classifier-name').text() +
        ' with a confidence above 50%';
      $tbody.html(
        '<tr class="base--tr use--output-tr" >' +
        '<td class="base--td use--output-td">' +
        message +
        '</td>' +
        '</tr>');
    } else {
      populateTable(scores);
    }

    $result.show();
    scrollToElement($result);
  }

  /**
   * Populates classifiers in the results table
   */
  function populateTable(classifiers) {
    var top5 = classifiers.slice(0, Math.min(5, classifiers.length));
    $tbody.html(top5.map(function rowFromClassifier(c) {
      return '<tr class="base--tr use--output-tr" >' +
        '<td class="base--td use--output-td">' +
        c.name +
        '</td>' +
        '<td class="base--td use--output-td ' +
        (c.score > 0.70 ? 'use--output-td_positive' : 'use--output-td_medium') + '">' +
        percentagify(c.score) + '% </td>' +
        '</tr>';
    }).join(''));
  }

  function showError(message) {
    $error.show();
    $errorMsg.html(message);
    console.log($error, $errorMsg);
  }

  function _error(xhr) {
    $loading.hide();
    var message = 'Error creating the classifier';
      if (xhr.responseJSON)
        message = xhr.responseJSON.error;

    showError(message);
  }

  /*
   * turns floating decimals into truncated percantages
   */
  function percentagify(num) {
    return Math.floor(parseFloat(num) * 100);
  }

  /*
   * submit event
   */
  function classifyImage(imgPath, imageData) {
    processImage();
    if (imgPath !== '') {
      $image.attr('src', imgPath);
      $urlInput.val(imgPath);
    }

    $imageDataInput.val(imageData);

    var url = '/api/classify';
    if (useClassifierId === true && CLASSIFIER_ID)
      url += '?classifier_id=' +  CLASSIFIER_ID;

    // Grab all form data
    $.post(url, $(pclass + 'form').serialize())
      .done(showResult)
      .error(function() {
        $loading.hide();
        showError('The demo is not available right now. <br/>We are working on ' +
        'getting this back up and running soon.');
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
    resetPasteUrl();
    var imgPath = $(this).next('label').find('img').attr('src');
    classifyImage(imgPath);
    $urlInput.val('');
  });

  /*
   * Image url submission
   */
  $urlInput.keypress(function(e) {
    var url = $(this).val();
    var self = $(this);

    if (e.keyCode === 13) {
      if (!isValidURL(url)) {
        $invalidImageUrl.hide();
        $invalidUrl.show();
        self.addClass(panel + '--url-input_error');
      } else {
        $invalidUrl.hide();
        $invalidImageUrl.hide();
        imageExists(url, function(exists) {
          if (!exists) {
            $invalidUrl.show();
            if (!/\.(jpg|png|gif)$/i.test(url))
              $invalidImageUrl.show();
            self.addClass(panel + '--url-input_error');
          } else {
            resetPasteUrl();
            classifyImage(url);
            self.blur();
          }
        });
      }
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
      var path = (useClassifierId && CLASSIFIER_ID) ? '?classifier_id=' + CLASSIFIER_ID : '';
      data.url = '/api/classify' + path;
      if (data.files && data.files[0]) {
        $error.hide();

        processImage();
        var reader = new FileReader();
        reader.onload = function() {
          var image = new Image();
          image.src = reader.result;
          image.onload = function() {
            $image.attr('src', this.src);
            classifyImage('', resize(image, 640));
          };
        };
        reader.readAsDataURL(data.files[0]);
        // do not submit the image
        //data.submit();
      }
    },
    error: _error,
    done: function(e, data) {
      showResult(data.result);
    }
  });

  /**
   * Async function to validate if an image exists
   * @param  {String}   url      The image URL
   * @param  {Function} callback The callback
   */
  function imageExists(url, callback) {
    var img = new Image();
    img.onload = function() {
      callback(true);
    };
    img.onerror = function() {
      callback(false);
    };
    img.src = url;
  }

  /**
   * url validation with or without http://
   * @param  {String}  url The URL
   * @return {Boolean}     True if is a valid url
   */
  function isValidURL(url) {
    // add the schema if needed
    if (url.indexOf('http://') !== 0 && url.indexOf('https://') !== 0) {
      url = 'http://' + url;
    }
    // remove training /
    if (url.substr(url.length - 1, 1) !== '/') {
      url = url + '/';
    }
    // validate URL with regular expression
    return /^(https|http|ftp):\/\/[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/i.test(url);
  }

  $(document).on('dragover', function() {
    $(pclass + 'dropzone label').addClass('dragover');
  });

  $(document).on('dragleave', function() {
    $(pclass + 'dropzone label').removeClass('dragover');
  });

  function convertFileToDataURLviaFileReader(url, callback){
      var xhr = new XMLHttpRequest();
      xhr.responseType = 'blob';
      xhr.onload = function() {
          var reader  = new FileReader();
          reader.onloadend = function () {
            var image = new Image();
            image.src = reader.result;
            image.onload = function() {
              callback(resize(image, 640));
            };
          };
          reader.readAsDataURL(xhr.response);
      };
      xhr.open('GET', url);
      xhr.send();
  }
  /**
   * scroll animation to element on page
   * @param  {$element}  Jquery element
   * @return {void}
   */
  function scrollToElement(element) {
    $('html, body').animate({
      scrollTop: element.offset().top
    }, 300);
  }
}
