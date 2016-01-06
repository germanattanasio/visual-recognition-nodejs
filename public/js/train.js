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

 /* global $:false, _, trainPreviewImagesTemplate, testClassifierImagesTemplate,
 landscapify, square, imageFadeIn, CLASSIFIER_ID */

 'use strict';

 $(document).ready(function () {

  // jquery elements we are using
  var $positivePreview = $('.train--positive-input .train--file-preview'),
      $negativePreview = $('.train--negative-input .train--file-preview'),
      $positiveNumFiles = $('.train--positive-input .train--files'),
      $negativeNumFiles = $('.train--negative-input .train--files'),
      $positiveMeter = $('.train--positive-input .train--file-meter-percent'),
      $negativeMeter = $('.train--negative-input .train--file-meter-percent'),
      $positiveIndicator = $('.train--positive-input .train--file-indicator'),
      $negativeIndicator = $('.train--negative-input .train--file-indicator'),
      $positivePreviewContainer = $('.train--positive-input .train--file-preview-container'),
      $negativePreviewContainer = $('.train--negative-input .train--file-preview-container'),
      $positiveClearButton = $('.positive-images .train--clear-button'),
      $negativeClearButton = $('.negative-images .train--clear-button'),
      $hiddenInput = $('.train--hidden-input'),
      $trainUrlInput = $('.train--url-input'),
      $trainInput = $('.train--input'),
      $trainButton = $('.train--train-button'),
      $trainInputErrMsg = $('.train--input-error-message'),
      $trainPositiveInputErrMsg = $('.train--input-positive-error-message'),
      $trainNegativeInputErrMsg = $('.train--input-negative-error-message'),
      $loading = $('.train--loading'),
      $error = $('.train--error'),
      $errorMsg = $('.train--error-message');

  var xhr;

  // underscore template
  var trainPreviewImages_template = trainPreviewImagesTemplate.innerHTML;

  // render images properly
  landscapify('.train--bundle-thumb');
  imageFadeIn('.square img');

  // file uploads
  setupFileuploads('positive');
  setupFileuploads('negative');

  function resetPage() {
    $trainInput.show();
    $loading.hide();
    $error.hide();
  }

  function loadPreviews(positiveImages, negativeImages) {
    loadPreviewsPositive(positiveImages);
    loadPreviewsNegative(negativeImages);
  }

  /*
   * Actions when images are loaded into the positive dropbox
   */
  function loadPreviewsPositive(images) {
    var numImages;
    var meterPercent;
    // load preview thumbnails
    $positivePreview.append(_.template(trainPreviewImages_template, {
      items: images
    })).find('img').each(function() {
      landscapify(this);
      imageFadeIn(this);
    });

    numImages = $('.train--positive-input .train--file-preview-image').length;

    // load number of images
    $positiveNumFiles.html(numImages);

    meterPercent = calculatePercentage(numImages);
    // load percentage
    $positiveMeter.css('width', meterPercent+'%');

    $positiveMeter.removeClass('train--file-meter-percent_good')
      .removeClass('train--file-meter-percent_medium');

    if (meterPercent >= 100)
      $positiveMeter.addClass('train--file-meter-percent_good');
  }

  /*
   * Actions when images are loaded into the negative dropbox
   */
  function loadPreviewsNegative(images) {
    var numImages;
    var meterPercent;
    // load preview thumbnails
    $negativePreview.append(_.template(trainPreviewImages_template, {
      items: images
    })).find('img').each(function() {
      landscapify(this);
      imageFadeIn(this);
    });

    numImages = $('.train--negative-input .train--file-preview-image').length;

    // load number of images
    $negativeNumFiles.html(numImages);

    meterPercent = calculatePercentage(numImages);
    // load percentage
    $negativeMeter.css('width', meterPercent+'%');

    $negativeMeter.removeClass('train--file-meter-percent_good')
      .removeClass('train--file-meter-percent_medium');

    if (meterPercent >= 100)
      $negativeMeter.addClass('train--file-meter-percent_good');
  }

  function resetPreviews() {
    resetPreviewsPositive();
    resetPreviewsNegative();
    $hiddenInput.val('');
    $trainUrlInput.val('');
  }

  function resetPreviewsPositive() {
    $positivePreview.empty();
    $positiveNumFiles.empty();
    $positiveMeter.css('width', '0%');
  }

  function resetPreviewsNegative() {
    $negativePreview.empty();
    $negativeNumFiles.empty();
    $negativeMeter.css('width', '0%');
  }

  function showPreviews() {
    showPreviewPositive();
    showPreviewNegative();
  }

  function showPreviewPositive() {
    $positivePreviewContainer.show();
    $positiveIndicator.show();
  }

  function showPreviewNegative() {
    $negativePreviewContainer.show();
    $negativeIndicator.show();
  }

  function hidePreviewsPositive() {
    $positivePreviewContainer.hide();
    $positiveIndicator.hide();
  }
  function hidePreviewsNegative() {
    $negativePreviewContainer.hide();
    $negativeIndicator.hide();
  }

  function calculatePercentage(num) {
    return Math.round(num / 50 * 100) <= 100 ? Math.round(num / 50 * 100) : 100;
  }

  /**
   * Select the test page and configure it with the created classifier
   * @param  {Object} classifier The created classifier
   */
  function setupTestPanel(classifier) {
    CLASSIFIER_ID = classifier.classifier_id;
    $('.tab-panels--tab[href="#panel2"]').trigger('click');
    scrollToElement($('.tab-views'));
    $('.test--classifier-name').text(classifier.name);
    landscapify('.test--example-image-overlay');
    imageFadeIn('.test--example-image-overlay');

    function toggleSection(selector) {
      $(selector).toggleClass('toggled');
      square();
    }

    // unbind all click events
    $('.test--classifier-images-title').off('click');
    $('.test--classifier-images-toggle .test--classifier-images-arrow').off('click');
    $('.test--classifier-images-header').off('click');
    $('.test--header').off('click');
    $('.test--input-container .test--classifier-images-arrow').off('click');

    // reset results
    $('.test--output').hide();

    $('.test--classifier-images-title').click(function(e) {
      toggleSection('.test--classifier-images-toggle');
      landscapify('.test--classifier-images-image');
    });
    $('.test--classifier-images-toggle .test--classifier-images-arrow').click(function() {
      toggleSection('.test--classifier-images-toggle');
      landscapify('.test--classifier-images-image');
    });
    $('.test--classifier-images-header').click(function() {
      toggleSection('.test--classifier-images-toggle');
      landscapify('.test--classifier-images-image');
    });

    $('.test--header').click(function(e) {
      toggleSection('.test--input-container');
      landscapify('.test--example-image');
      landscapify('.test--output-image');
    });
    $('.test--input-container .test--classifier-images-arrow').click(function() {
      toggleSection('.test--input-container');
      landscapify('.test--example-image');
      landscapify('.test--output-image');
    });
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

  var datasets = {};
  $.getJSON('data/datasets.json', function(data) {
    datasets = data.datasets;
  });

  /*
   * When 'use bundle' buttons are clicked
   */
  $('.train--bundle-select-all').click(function() {
    var id = $(this).data('id');
    showTestSamples(id);
    scrollToElement($('.tab-panels--tab-content'));

      var dataset = datasets.filter(function(item) { return item.id === id; })[0];
      var positive = [];
      var negative = [];
      for (var i = 0; i < dataset.positive; i++) {
        positive.push('images/datasets/' + id + '/positive/' + i + '.jpg');
      }
      for (var j = 0; j < dataset.negative; j++) {
        negative.push('images/datasets/' + id + '/negative/' + j + '.jpg');
      }

      $error.hide();
      resetPreviews();
      loadPreviews(positive, negative);
      $trainUrlInput.val(dataset.name);
      showPreviews();
      setTrainButtonState();
      setInputErrorState();
      $('.tab-panels--tab[href="#panel3"]').addClass('disabled');
  });

  $positiveClearButton.click(function(e) {
    e.preventDefault();
    resetPreviewsPositive();
    hidePreviewsPositive();
    setTrainButtonState();
    $trainPositiveInputErrMsg.hide();
    resetTestSamples();
  });

  $negativeClearButton.click(function(e) {
    e.preventDefault();
    resetPreviewsNegative();
    hidePreviewsNegative();
    setTrainButtonState();
    $trainPositiveInputErrMsg.hide();
    resetTestSamples();
  });

  function getImageSrc(_, e2) {
      return $(e2).attr('src');
  }

  $trainButton.click(function() {
    var images = {
      positives: $('.positive-images img').map(getImageSrc).toArray(),
      negatives: $('.negative-images img').map(getImageSrc).toArray(),
      name: $('.train--name-input').val()
    };

    $trainInput.hide();
    $loading.show();
    $error.hide();

    populateTestThumbnails(images.positives, images.negatives);

    xhr = $.ajax({
      type: 'POST',
      url: '/api/classifiers',
      data: JSON.stringify(images),
      contentType: 'application/json; charset=utf-8',
      dataType: 'json',
      success: function(result) {
        resetPage();
        setupTestPanel(result);
        $('.tab-panels--tab[href="#panel3"]').removeClass('disabled').trigger('click');
      },
      error: function(err) {
        $loading.hide();
        $trainInput.hide();
        $error.show();
        var message = 'Error creating the classifier';
          if (err.responseJSON)
            message = err.responseJSON.error;

        $errorMsg.html(message);
      }
    });
  });

  $trainUrlInput.on('propertychange change click keyup input paste', function() {
    setTrainButtonState();
    setInputErrorState();
    $('.tab-panels--tab[href="#panel3"]').addClass('disabled');
  });

  function populateTestThumbnails(positives, negatives) {
    var $positiveImages = $('.test--classifier-images-thumbs_positive'),
        $negativeImages = $('.test--classifier-images-thumbs_negative');

    var testClassifierImages_template = testClassifierImagesTemplate.innerHTML;

    $positiveImages.empty();
    $negativeImages.empty();

    $positiveImages.append(_.template(testClassifierImages_template, {
      items: positives
    })).find('img').each(function() {
      landscapify(this);
      imageFadeIn(this);
    });

    $negativeImages.append(_.template(testClassifierImages_template, {
      items: negatives
    })).find('img').each(function() {
      landscapify(this);
      imageFadeIn(this);
    });
  }

  /**
   * Jquery file upload configuration
   * See details: https://github.com/blueimp/jQuery-File-Upload
   */
  function setupFileuploads(dropzoneType) {
    $('#train--fileupload_' + dropzoneType).fileupload({
      url: '/api/classify',
      dataType: 'json',
      dropZone: $('#train--fileupload_' + dropzoneType + ' label'),
      acceptFileTypes: /(\.|\/)(gif|jpe?g|png)$/i,
      add: function(e, data) {
        if (data.files && data.files[0]) {
          var reader = new FileReader();

          reader.onload = function() {
            var image = new Image();
            image.src = reader.result;
            image.onload = function() {
              // display thumbs
              var resizedImage = resize(image, 320);
              if (dropzoneType === 'positive') {
                loadPreviewsPositive([resizedImage]);
                showPreviewPositive();
              }
              else if (dropzoneType === 'negative') {
                loadPreviewsNegative([resizedImage]);
                showPreviewNegative();
              }
              setTrainButtonState();
            };
          };

          reader.readAsDataURL(data.files[0]);
        }
        $('.train--dropzone label').removeClass('dragover');
        resetTestSamples();
        $('.tab-panels--tab[href="#panel3"]').addClass('disabled');
      },
      error: _error,
      done: function(e, data) {
        console.log('results!!',data);
      }
    });
  }

  function _error() {}

  $(document).on('dragover', function() {
    $('.train--dropzone label').addClass('dragover');
  });

  $(document).on('dragleave', function() {
    $('.train--dropzone label').removeClass('dragover');
  });


  function resize(image, maxSize) {
    var c = window.document.createElement('canvas'),
      ctx = c.getContext('2d'),
      ratio = image.width / image.height;

    c.width = (ratio > 1 ? maxSize : maxSize * ratio);
    c.height = (ratio > 1 ? maxSize / ratio : maxSize);

    ctx.drawImage(image, 0, 0, c.width, c.height);
    return c.toDataURL('image/jpeg');
  }

  function setTrainButtonState() {
    var button = document.querySelector('.train--train-button');
    if ($trainUrlInput.val() !== '' &&
      $('.positive-images img').length > 0 &&
      $('.negative-images img').length > 0 &&
      isNameValid()){
        $trainButton.prop('disabled', false);
        button.disabled = false;
    } else {
      $trainButton.prop('disabled', true);
      button.disabled = true;
    }
  }

  function isNameValid() {
    return /^([a-zA-Z0-9]| |_|\-)*$/g.test($trainUrlInput.val());
  }
  function setInputErrorState() {
    if (isNameValid()) {
      $trainUrlInput.removeClass('train--url-input_error');
      $trainInputErrMsg.hide();
    } else {
      $trainUrlInput.addClass('train--url-input_error');
      $trainInputErrMsg.show();
    }
  }

  function showTestSamples(id) {
    $('.test--example-images').hide();
    $('.test--example-images_' + id).show();
  }
  function resetTestSamples() {
    $('.test--example-images').hide();
    $('.test--example-images_default').show();
  }

  $('.tab-panels--tab[href="#panel2"]').click(function() {
    if (xhr)
      xhr.abort();
    setTrainButtonState();
    setInputErrorState();
    resetPage();
  });

});
