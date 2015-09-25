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
/*global $:false */


/**
 * Anonymous function, to use as a wrapper
 */
(function() {

  function processImage() {
    $('.selected-classifier').text('Classifier: ' + $("select[name='classifier'] option:selected").text());
    $('.loading').show();
    $('.result').show();
    $('.error').hide();
    $('.data').empty();

    $('.image-radio').each(function() {
      $(this).prop('disabled', true);
    });
    $('.image-options').addClass('disabled');
  }

  /**
   * Show the service results in the HTML
   * @param  {Object} results e.g
   * {
   *   "classifier": "0",
   *   "images": [{
   *   "image_id": "0",
   *   "image_name": "",
   *   "labels": [{
   *     "label_name": "",
   *     "label_score": ""
   *   }]
   * }]
   * }
   *
   */
  function showResult(results) {
    $('.loading').hide();

    if (!results || !results.images || !results.images[0]) {
      $('errorMsg').text('Error processing the request, please try again later.');
      return;
    }

    var labels = results.images[0].labels;

    if (!labels) {
      var classifier = $('#classifier').val();
      var message = 'No labels recognized in the image';

      if (classifier !== '0')
        message = 'No labels (from ' + classifier + ' grouping) recognized in the image';

      $('.empty-text').text(message);
      $('.empty-results').show();
    } else {
      $('.empty-results').hide();
    }

    if (!labels || labels.length === 0) {
      $('errorMsg').text('The image could not be classified');
      return;
    }
    var first = labels[0];

    populateTable(labels);

    $('.image_label').val(first.label_name);
    $('.image_score').text(first.label_score);
  }

  // populate table in results
  function populateTable(labels) {
    var htmlString = '<tbody>';

    for (var i = 0; i < labels.length; i++) {
      htmlString += '<tr>';
      htmlString += '<td>';
      htmlString += labels[i].label_name;
      htmlString += '</td>';
      htmlString += '<td>';
      htmlString += percentagify(labels[i].label_score) + '%';
      htmlString += '</td>';
      htmlString += '</tr>';
    }

    htmlString += '</tbody>';

    $('.data').append(htmlString);
  }

  function _error(xhr) {
    $('.loading').hide();
    $('.error').show();
    var response = JSON.parse(xhr.responseText);
    $('.error h4').text(response.error);
  }

  // turns floating decimals into truncated percantages
  function percentagify(num) {
    return Math.floor(num * 100);
  }

  // submit event
  function classifyImage(imgPath) {
    processImage();
    $('.image-staged img').attr('src', imgPath);
    $('.image-staged').show();
    $('.upload-form').hide();
    $('.url-input').val(imgPath);

    // Grab all form data
    $.ajax({
      url: '/',
      type: 'POST',
      data: $('form').serialize(),
      success: showResult,
      error: _error
    });
  }

  $('#fileupload').submit(function (e) {
    e.preventDefault();
    return false;
  });

  // radio button image
  $('.image-radio').click(function() {
    var imgPath = $(this).next('label').find('img').attr('src');
    console.log(imgPath);
    classifyImage(imgPath);
  });

  // url image
  $('input[name="url"]').keypress(function(e) {
    var url = $(this).val();
    var self = $(this);

    if (e.keyCode === 13) {
      if (!isValidURL(url)) {
        $('.invalid-image-url').hide();
        $('.invalid-url').show();
        self.addClass('error-highlight');
      } else {
        $('.invalid-url').hide();
        $('.invalid-image-url').hide();
        imageExists(url, function(exists) {
          if (!exists) {
            $('.invalid-image-url').show();
            self.addClass('error-highlight');
          } else {
            $('.invalid-image-url').hide();
            classifyImage(url);
          }
        });
      }
    }
  });

  /**
   * Jquery file upload configuration
   * See details: https://github.com/blueimp/jQuery-File-Upload
   */
  $(function() {
    $('#fileupload').fileupload({
      dataType: 'json',
      dropZone: $('.dropzone'),
      acceptFileTypes: /(\.|\/)(gif|jpe?g|png)$/i,
      maxFileSize: 5000000, // 5 MB
      add: function(e, data) {
        if (data.files && data.files[0]) {
          processImage();
          $('.upload-form').hide();
          var reader = new FileReader();
          reader.onload = function() {
            var image = new Image();
            image.src = reader.result;
            image.onload = function() {
              $('.image-staged').show();
              $('#image-staged').attr('src', this.src);
            };
          };
          reader.readAsDataURL(data.files[0]);
          data.submit();
        }
      },
      error: _error,
      done: function(e, data) {
        $('.status').hide();
        console.log('e:', e);
        console.log('data:', data);
        showResult(data.result);
      }
    });
  });

  function imageExists(url, callback) {
    var img = new Image();
    img.onload = function() { callback(true); };
    img.onerror = function() { callback(false); };
    img.src = url;
  }


  // custom method for url validation with or without http://
  function isValidURL(url) {
    if(url.indexOf('http://') !== 0 && url.indexOf('https://') !== 0){
      url = 'http://' + url;
    }
    if(url.substr(url.length-1, 1) !== '/'){
      url = url + '/';
    }
    return /^(https|http|ftp):\/\/[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/i.test(url);
  }

  $(document).on('dragover', function () {
    $('.dropzone label').addClass('hover');
  });

  $(document).on('dragleave', function () {
    $('.dropzone label').removeClass('hover');
  });

})();