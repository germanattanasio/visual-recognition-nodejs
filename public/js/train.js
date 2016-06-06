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
var currentPage = require('./demo.js').currentPage;

$(document).ready(function() {
  $('._training--example').click(function() {
    $('.showing div._examples--class__selected button').click();
    var kind = $(this).data('kind');
    if ($('._examples[data-kind=' + kind + ']').hasClass('showing')) {
      $('.showing').removeClass('showing');
      $('._container--bundle-form').removeClass('active');
    } else {
      $('.showing').removeClass('showing');
      $('._examples[data-kind=' + kind + ']').removeClass('removed');
      $('._container--bundle-form input[type=submit]').addClass('disabled');
      $('._container--bundle-form input[type=submit]').prop('disabled', true);
      setTimeout(function() {
        $('.showing').addClass('removed');
        $('._examples[data-kind=' + kind + ']').addClass('showing');
        $('._container--bundle-form').addClass('active');
      }, 100);
    }
  });

  $('._examples--class button').click(function() {
    if ($(this).parent().hasClass('_examples--class__selected')) {
      $(this).data('selected', 0);
      $(this).html('Select');
    } else {
      $(this).data('selected', 1);
      $(this).html('Selected');
    }
    $(this).parent().toggleClass('_examples--class__selected');

    if ($('.showing ._examples--class__selected._positive').length > 2 ||
      ($('.showing ._examples--class__selected._positive').length > 0 && $('.showing ._examples--class__selected._negative').length === 1 )
     ) {
      $('.train--train-button.base--button').removeClass('disabled');
      $('.train--train-button.base--button').prop('disabled', false);
    } else {
      $('.train--train-button.base--button').addClass('disabled');
      $('.train--train-button.base--button').prop('disabled', true);
    }
    return false;
  });

  $('._examples--class img').click(function() {
    $(this).data('name');
    $('._examples--contact-sheet[data-kind=' + $(this).data('kind') + '] img').attr('src', '/images/bundles/' + $(this).data('kind') + '/' + $(this).data('name') + '-contact.jpg');
    $('._examples--contact-sheet[data-kind=' + $(this).data('kind') + ']').css('display', 'flex');
  });

  $('._examples--contact-sheet img').click(function() {
    $(this).attr('src', '');
    $(this).parent().css('display', 'none');
  });

  $('a.select_all').click(function() {
    if ($('.showing div._examples--class:not(._examples--class__selected)').length > 0) {
      $('.showing div._examples--class:not(._examples--class__selected) button').click();
    } else {
      $('.showing div._examples--class__selected button').click();
    }
    $(this).text($(this).text() === 'Select All' ? 'Deselect All' : 'Select All');
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

  $trainButton.click(function() {
    $trainInput.hide();
    $loading.show();
    $error.hide();

    var data = $('.showing div._examples--class__selected')
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
    }, { bundles: [], names: []});

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
  setupUse({ panel: 'test'});

  var classifier = Cookies.get('classifier');
  // enable test if there is trained classifier
  if (classifier) {
    $('.tab-panels--tab[href="/test"]').removeClass('disabled');
  }
  // send the user to train if they hit /test without a trained classifier
  if (currentPage() === '/test') {
    if (!classifier) {
      $('.tab-panels--tab[href="/train"]').trigger('click');
    }
  }
});
