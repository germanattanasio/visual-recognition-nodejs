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

/* global $:false, Cookies, _, trainPreviewImagesTemplate, testClassifierImagesTemplate,
landscapify, square, imageFadeIn, CLASSIFIER_ID, setupUse, currentPage, nextHour*/

'use strict';

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

    if ($('.showing ._examples--class__selected._positive').length >= 2) {
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
    $(this).text($(this).text() === 'Select All' ? 'Unselect All' : 'Select All');
  });
});
