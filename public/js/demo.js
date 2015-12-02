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

 /* global $:false */
'use strict';

// if image is landscape, tag it
function addLandscape(imgElement) {
  if (imgElement.height < imgElement.width)
    imgElement.classList.add('landscape');
}

// attach landscape class on image load event
function landscapify(imgSelector) {
  $(imgSelector).on('load', function() {
    addLandscape(this);
  }).each(function() {
    if (this.complete)
      $(this).load();
  });
}

// square images
function square() {
  $('.square').each(function() {
    $(this).css('height', $(this)[0].getBoundingClientRect().width + 'px');
  });
}

function imageFadeIn(imgSelector) {
  $(imgSelector).on('load', function() {
    $(this).addClass('loaded');
  }).each(function() {
    if (this.complete)
      $(this).load();
  });
}

$(document).ready(function () {

  // tagging which images are landscape
  landscapify('.use--example-image');
  landscapify('.use--output-image');
  landscapify('.train--bundle-thumb');
  landscapify('.test--example-image');
  landscapify('.test--output-image');

  square();
  imageFadeIn('.square img');

  $(window).resize(square);

  // tab listener
  $('.tab-panels--tab').click(function(e){
    e.preventDefault();
    var self = $(this);
    var inputGroup = self.closest('.tab-panels');
    var idName = null;

    if (!self.hasClass('disabled')) {
        inputGroup.find('.active').removeClass('active');
        self.addClass('active');
        idName = self.attr('href');
        $(idName).addClass('active');
    }

    square();
    landscapify('.use--example-image');
    landscapify('.use--output-image');
    landscapify('.train--bundle-thumb');
    landscapify('.test--example-image');
    landscapify('.test--output-image');

    $('.dragover').removeClass('dragover');
  });
});
