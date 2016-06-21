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

/* global Cookies:true */

'use strict';

var setupUse = require('./use.js');
var nextHour = require('./demo.js').nextHour;
var scrollToElement = require('./demo.js').scrollToElement;
var getAndParseCookieName = require('./demo.js').getAndParseCookieName;

// var currentPage = require('./demo.js').currentPage;

$(document).ready(function() {
  $('._training--example').click(function() {
    var currentExample = $(this);

    $('.showing div._examples--class__selected button').click();
    // clear all user classifier info
    $('.classifier').attr('data-hasfile', '0');

    var kind = $(this).data('kind');

    if ($('._examples[data-kind=' + kind + ']').hasClass('showing')) {
      $('.showing').removeClass('showing');
      $('._container--bundle-form').removeClass('active');
      $('._training--example').map(function(index, item) {
        $(item).css('opacity', '1.0');
        $(item).find('img').css('box-shadow', '0px 0px 0px 0px transparent');
        $(item).find('._training--use-your-own').css('box-shadow', '0px 0px 0px 0px transparent');
      });
    } else {
      $('._training--example').map(function(index, item) {
        if (!$(item).is(currentExample)) {
          $(item).css('opacity', '0.5');
          $(item).find('img').css('box-shadow', '0px 0px 0px 0px transparent');
          $(item).find('._training--use-your-own').css('box-shadow', '0px 0px 0px 0px transparent');
        } else {
          $(item).css('opacity', '1.0');
          $(item).find('img').css('box-shadow', '0px 0px 0px 3px #336588');
          $(item).find('._training--use-your-own').css('box-shadow', '0px 0px 0px 3px #336588');
        }
      });
      $('.showing').removeClass('showing');
      $('._examples[data-kind=' + kind + ']').removeClass('removed');
      $('._container--bundle-form input[type=submit]').addClass('disabled');
      $('._container--bundle-form input[type=submit]').prop('disabled', true);
      setTimeout(function() {
        $('.showing').addClass('removed');
        $('._examples[data-kind=' + kind + ']').addClass('showing');
        $('.train--row').addClass('showing');
        if (lookupName(kind)) {
          $('input.base--input._examples--input-name').val('Name of classifier: ' + lookupName(kind));
          $('input.base--input._examples--input-name').prop('readonly', true);
          $('input.base--input._examples--input-name').addClass('bundle');
        } else {
          $('input.base--input._examples--input-name').val('');
          $('input.base--input._examples--input-name').prop('readonly', false);
          $('input.base--input._examples--input-name').removeClass('bundle');
        }
        $('._container--bundle-form').addClass('active');
      }, 100);

      setTimeout(function() {
        scrollToElement($('._examples.showing'));
      }, 100);

      if ($(this).css('opacity') === '0.5') {
        $testSection.hide();
      }
    }
  });

  function warningMessagesVisability() {
    if ($('.classifier[data-hasfile=1]').length > 1) {
      $('.upload_message').hide();
      return true;
    } else {
      $('.upload_message').show();
      return false;
    }
  }

  function enableTrainClassifier() {
    var enable = $('.showing ._examples--class__selected._positive').length > 2;
    enable = enable || ($('.showing ._examples--class__selected._positive').length > 0 && $('.showing ._examples--class__selected._negative').length === 1 );
    enable = enable || warningMessagesVisability();

    // the name has to be filled out, too
    if (enable && $('.base--input._examples--input-name').val().length) {
      $('.train--train-button.base--button').removeClass('disabled');
      $('.train--train-button.base--button').prop('disabled', false);
    } else {
      $('.train--train-button.base--button').addClass('disabled');
      $('.train--train-button.base--button').prop('disabled', true);
    }
  }

  $('button[type=reset]').click(function() {
    if ($('.showing div._examples--class__selected button').length > 0) {
      $('.showing div._examples--class__selected button').click();
    } else {
      $('form.upload')[0].reset();
      if (!$('input.base--input._examples--input-name').prop('readonly')) {
        $('input.base--input._examples--input-name').val('');
        $('input.base--input._examples--input-name').prop('readonly', false);
      }
    }
    $testSection.hide();
    enableTrainClassifier();
  });

  $('._examples--class button').click(function() {
    if ($(this).parent().hasClass('_examples--class__selected')) {
      $(this).data('selected', 0);
      $(this).html('Select');
    } else {
      $(this).data('selected', 1);
      $(this).html('Deselect');
    }
    $(this).parent().toggleClass('_examples--class__selected');

    enableTrainClassifier();

    if ($.map($('._examples--class[data-kind=' + $(this).parent().data('kind') + '] button'), function(item) { return $(item).text(); }).reduce(function(k, v) { return k || v === 'Select'; }, false)) {
      $('a.select_all').text('Select All');
    }

    return false;
  });

  $('._examples--class img').click(function() {
    var contactSheet = $('._examples--contact-sheet[data-kind=' + $(this).data('kind') + ']');
    if ( $(this).css('box-shadow') === 'rgb(51, 101, 136) 0px 0px 0px 3px' && contactSheet.css('display') === 'flex') {
      contactSheet.hide();
    } else {
      $('._examples--class img').css('box-shadow', '0px 0px 0px 0px transparent');
      $(this).css('box-shadow', '0px 0px 0px 3px #336588');
      $(this).data('name');
      $('._examples--contact-sheet[data-kind=' + $(this).data('kind') + '] img').attr('src', '/images/bundles/' + $(this).data('kind') + '/' + $(this).data('name') + '-contact.jpg');
      contactSheet.css('display', 'flex');

      setTimeout(function() {
        scrollToElement(contactSheet);
      }, 100);
    }
  });

  $('._examples--contact-sheet img').click(function() {
    $(this).attr('src', '');
    $(this).parent().css('display', 'none');

    scrollToElement($('._examples.showing'));
  });

  $('a.select_all').click(function() {
    var currentText = $(this).text();
    if ($('.showing div._examples--class:not(._examples--class__selected)').length > 0) {
      $('.showing div._examples--class:not(._examples--class__selected) button').click();
    } else {
      $('.showing div._examples--class__selected button').click();
    }
    $(this).text(currentText === 'Select All' ? 'Deselect All' : 'Select All');
  });

  $('.classifier .text').on('click', function(e) {
    e.preventDefault();
    $(this).parent().find('input[type=file]').click();
  });

  $('.classifier input[type=file]').on('change', function(e) {
    var nameInput = $(e.target).parent().find('input[type=text]');
    if ($(e.target).length > 0 && ($(e.target)[0].files && $(e.target)[0].files.length > 0)) {
      if ($(e.target)[0].files[0].size > (5 * 1024 * 1024)) {
        // eslint-disable-line no-alert
        alert('This file exceeds the maximum size of 5 MB. Please choose another file');
      }
      var baseFileName = $(e.target)[0].files[0].name;
      nameInput.val(baseFileName.split('.')[0]);
      $(e.target).parent().attr('data-hasfile', 1);
      $(e.target).parent().find('.text-label').hide();
      $(e.target).parent().find('.text-zip-image').css('display', 'block');
      $(e.target).parent().find('.clear_link').show();
    }
  });

  $('.classifier a.clear_link').on('click', function(e) {
    e.preventDefault();
    $(e.target).parent().find('input').val('');
    $(e.target).parent().attr('data-hasfile', '0');
    $(e.target).parent().find('.text').find('.text-label').show();
    $(e.target).parent().find('.text').find('.text-zip-image').hide();
    $(e.target).parent().find('.clear_link').hide();
    enableTrainClassifier();
  });

  $('input[type=text].base--input._examples--input-name').on('input', function() {
    $('form.upload input[type=hidden][name=classifiername]').val($(this).val());
    enableTrainClassifier();
  });

  $('form.upload.training_dropzone').on('change', function() {
    enableTrainClassifier();
  });

  $('._examples--user-input').on('drop', function(e) {
    e.preventDefault();
  });

  var $loading = $('.train--loading');
  var $error = $('.train--error');
  var $errorMsg = $('.train--error-message');
  var $trainButton = $('.train--train-button');
  var $testSection = $('.test--section');

  function resetPage() {
    $loading.hide();
    $error.hide();
  }

  function showTrainingError(err) {
    $loading.hide();
    $error.show();
    var message = 'Error creating the classifier';
    if (err.responseJSON) {
      message = err.responseJSON.error;
    }
    $errorMsg.html(message);
  }

  function lookupName(token) {
    return {
      moleskine: 'Moleskine Types',
      dogs: 'Dog Breeds',
      insurance: 'Insurance Claims',
      omniearth: 'Satellite Imagery'
    }[token];
  }

  function lookupClassiferRealNameMap() {
    var classifierNameMapping = {};
    classifierNameMapping.dogs = {};
    classifierNameMapping.dogs.goldenretriever = 'Golden Retriever';
    classifierNameMapping.dogs.husky = 'Husky';
    classifierNameMapping.dogs.dalmatian = 'Dalmatian';
    classifierNameMapping.dogs.beagle = 'Beagle';
    classifierNameMapping.insurance = {};
    classifierNameMapping.insurance.brokenwinshield = 'Broken Windshield';
    classifierNameMapping.insurance.flattire = 'Flat Tire';
    classifierNameMapping.insurance.motorcycleaccident = 'Motorcycle Accident';
    classifierNameMapping.insurance.vandalism = 'Vandalism';
    classifierNameMapping.moleskine = {};
    classifierNameMapping.moleskine.journaling = 'Journaling';
    classifierNameMapping.moleskine.landscape = 'Landscape';
    classifierNameMapping.moleskine.notebook = 'Notebook';
    classifierNameMapping.moleskine.portrait = 'Portrait';
    classifierNameMapping.omniearth = {};
    classifierNameMapping.omniearth.baseball = 'Baseball';
    classifierNameMapping.omniearth.cars = 'Cars';
    classifierNameMapping.omniearth.golf = 'Golf';
    classifierNameMapping.omniearth.tennis = 'Tennis';
    return classifierNameMapping;
  }

  function getExamplesData() {
    return $('.showing div._examples--class__selected')
        .map(function(idx, item) {
          return {
            name: $(item).data('name'),
            realname: $(item).data('realname'),
            kind: $(item).data('kind')
          };
        })
        .toArray().reduce(function(k, v) {
          k.bundles.push(v.name);
          if (v.realname) {
            k.names.push(v.realname);
          }
          k.kind = v.kind;
          return k;
        }, {bundles: [], names: []});
  }

  function flashTrainedClassifer() {
    $('.train--trained-successfully').addClass('showing');
    setTimeout(function() {
      $('.train--trained-successfully').removeClass('showing');
    }, 3000);
  }

  function uploadBundledClass() {
    var data = getExamplesData();
    data.name = lookupName(data.kind);
    submitClassifier({
      data: JSON.stringify(data),
      bundle: data,
      contentType: 'application/json; charset=utf-8'
    });
  }

  function uploadUserClass() {
    var formElement = document.querySelector('form#user_upload');
    var form = new FormData(formElement);
    var bundle = { names: [$('.base--input._examples--input-name').val()], kind: 'user' };
    submitClassifier({
      data: form,
      bundle: bundle
    });
  }

  function submitClassifier(params) {
    $.ajax({
      type: 'POST',
      url: '/api/classifiers',
      data: params.data,
      contentType: params.contentType || false,
      processData: false,
      dataType: 'json',
      success: function(classifier) {
        setTimeout(function() {
          checkClassifier(classifier.classifier_id, function done() {
            Cookies.set('bundle', params.bundle, { expires: nextHour()});
            Cookies.set('classNameMap', lookupClassiferRealNameMap(), { expires: nextHour()});
            Cookies.set('classifier', classifier, { expires: nextHour()});
            resetPage();
            flashTrainedClassifer();
            scrollToElement($('.train--trained-successfully'), 65);
            $('.test--section').show();
            $('.test--classifier').text($('input.base--input._examples--input-name').val());
            showTestPanel(classifier);
          });
        }, 5000);
      },
      error: showTrainingError
    });
  }

  $trainButton.click(function() {
    $loading.show();
    $error.hide();
    $testSection.hide();

    scrollToElement($loading);

    if ($('.showing').data('kind') === 'user') {
      uploadUserClass();
    } else {
      uploadBundledClass();
    }
  });

  var classifierCheckPollInterval = 5000;
  var totalWaitingTime = 0;
  function checkClassifier(classifierId, done) {
    totalWaitingTime += classifierCheckPollInterval;
    $.get('/api/classifiers/' + classifierId)
    .success(function(data) {
      if (data.status === 'ready') {
        done(data);
      } else if (data.status === 'failed') {
        showTrainingError();
      } else {
        setTimeout(checkClassifier, classifierCheckPollInterval, classifierId, done);
      }
    })
    .fail(showTrainingError);
  }

  setupUse({ panel: 'use' });
  setupUse({ panel: 'test' });

  function showTestPanel(classifier) {
    // TODO: send classifier-id
    $('#test_classifier_id').val(classifier.classifier_id);
    $('.base--h2.test--classifier').text(classifier.name);
    $testSection.show();
  }

  var classifier = getAndParseCookieName('classifier');
  if (classifier) {
    showTestPanel(classifier);
  }
});
