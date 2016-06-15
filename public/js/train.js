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
          $('input.base--input._examples--input-name').val(lookupName(kind));
          $('input.base--input._examples--input-name').prop('readonly', true);
        } else {
          $('input.base--input._examples--input-name').val('');
          $('input.base--input._examples--input-name').prop('readonly', false);
        }
        $('._container--bundle-form').addClass('active');
      }, 100);
    }
  });

  function enableTrainClassifier() {
    var enable = $('.showing ._examples--class__selected._positive').length > 2;
    enable = enable || ($('.showing ._examples--class__selected._positive').length > 0 && $('.showing ._examples--class__selected._negative').length === 1 );
    enable = enable || $('.classifier[data-hasfile=1]').length > 1;

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
      $('input.base--input._examples--input-name').val('');
      $('input.base--input._examples--input-name').prop('readonly', false);
    }
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
    $('._examples--class img').css('box-shadow', '0px 0px 0px 0px transparent');
    $(this).css('box-shadow', '0px 0px 0px 3px #336588');
    $(this).data('name');
    $('._examples--contact-sheet[data-kind=' + $(this).data('kind') + '] img').attr('src', '/images/bundles/' + $(this).data('kind') + '/' + $(this).data('name') + '-contact.jpg');
    $('._examples--contact-sheet[data-kind=' + $(this).data('kind') + ']').css('display', 'flex');
  });

  $('._examples--contact-sheet img').click(function() {
    $(this).attr('src', '');
    $(this).parent().css('display', 'none');
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
      var baseFileName = $(e.target)[0].files[0].name;
      nameInput.val(baseFileName.split('.')[0]);
      $(e.target).parent().attr('data-hasfile', 1);
      console.log($(e.target).parent().attr('data-hasfile'));

      $(e.target).parent().find('.text-label').hide();
      $(e.target).parent().find('.text-zip-image').css('display', 'block');
    }
  });

  $('.classifier a.clear_link').on('click', function(e) {
    e.preventDefault();
    $(e.target).parent().find('input').val('');
    $(e.target).parent().attr('data-hasfile', '0');
    $(e.target).parent().find('.text').find('.text-label').show();
    $(e.target).parent().find('.text').find('.text-zip-image').hide();
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
  var $trainInput = $('._container--training');

  function resetPage() {
    $trainInput.show();
    $loading.hide();
    $error.hide();
  }

  function showTrainingError(err) {
    $loading.hide();
    $trainInput.hide();
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
      dogs: 'Dogs',
      insurance: 'Insurance Claims',
      omniearth: 'Satellite Images'

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

  function uploadBundledClass() {
    var data = getExamplesData();

    data.name = lookupName(data.kind);

    $.ajax({
      type: 'POST',
      url: '/api/classifiers',
      data: JSON.stringify(data),
      contentType: 'application/json; charset=utf-8',
      dataType: 'json',
      success: function(classifier) {
        checkClassifier(classifier.classifier_id, function done() {
          Cookies.set('bundle', data, { expires: nextHour()});
          Cookies.set('classNameMap', lookupClassiferRealNameMap(), { expires: nextHour()});
          Cookies.set('classifier', classifier, { expires: nextHour()});
          resetPage();
          window.location.href = '/test';
        });
      },
      error: showTrainingError
    });
  }

  function uploadUserClass() {
    var formElement = document.querySelector('form#user_upload');
    var form = new FormData(formElement);
    var allFiles = form.getAll('classupload').concat(form.getAll('negativeclassupload'));
    var classnames = form.getAll('classname').filter(function(item, idx) {
      return allFiles[idx].size > 0;
    });
    var data = { name: form.getAll('classifiername')[0], kind: 'user', names: classnames };

    $.ajax({
      type: 'POST',
      url: '/api/classifiers',
      data: form,
      contentType: false,
      processData: false,
      dataType: 'json',
      success: function(classifier) {
        checkClassifier(classifier.classifier_id, function done() {
          Cookies.set('bundle', data, { expires: nextHour()});
          Cookies.set('classNameMap', lookupClassiferRealNameMap(), { expires: nextHour()});
          Cookies.set('classifier', classifier, { expires: nextHour()});
          resetPage();
          window.location.href = '/test';
        });
      },
      error: showTrainingError
    });
  }

  $trainButton.click(function() {
    $trainInput.hide();
    $loading.show();
    $error.hide();

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
        done(classifier);
      } else if (data.status === 'failed') {
        showTrainingError();
      } else {
        setTimeout(checkClassifier, classifierCheckPollInterval, classifierId, done);
      }
    })
    .fail(showTrainingError);
  }

  // init pages
  setupUse({ panel: 'use' });
  setupUse({ panel: 'test' });

  var classifier = Cookies.get('classifier');

  if (classifier) {
    console.log('show the test UI');
  }

  setTimeout(function() {
    $('.train--trained-successfully').removeClass('showing');
  }, 3000);
});
