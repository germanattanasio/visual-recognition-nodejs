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
 /* global _, Cookies, _ */
'use strict';

/**
 * Returns the next hour as Date
 * @return {Date} the next hour
 */
module.exports.nextHour = function nextHour() {
  var oneHour = new Date();
  oneHour.setHours(oneHour.getHours() + 1);
  return oneHour;
};

/**
 * Returns a random integer between min (inclusive) and max (inclusive)
 * Using Math.round() will give you a non-uniform distribution!
 * @param {Number} min The minium value
 * @param {Number} max The maximum value
 * @return {Number} random number
 */
module.exports.getRandomInt = function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

/**
 * Resizes an image
 * @param  {String} image   The base64 image
 * @param  {int} maxSize maximum size
 * @return {String}         The base64 resized image
 */
module.exports.resize = function(image, maxSize) {
  var c = window.document.createElement('canvas');
  var ctx = c.getContext('2d');
  var ratio = image.width / image.height;

  if (image.width < maxSize && image.height < maxSize) {
    c.width = image.width;
    c.height = image.height;
  } else {
    c.width = (ratio > 1 ? maxSize : maxSize * ratio);
    c.height = (ratio > 1 ? maxSize / ratio : maxSize);
  }

  ctx.drawImage(image, 0, 0, c.width, c.height);
  return c.toDataURL('image/jpeg');
};

// if image is landscape, tag it
function addLandscape(imgElement) {
  if (imgElement.height < imgElement.width) {
    imgElement.classList.add('landscape');
  }
}

// attach landscape class on image load event
function landscapify(imgSelector) {
  $(imgSelector).on('load', function() {
    addLandscape(this);
  }).each(function() {
    if (this.complete) {
      $(this).load();
    }
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
    if (this.complete) {
      $(this).load();
    }
  });
}

/**
 * scroll animation to element on page
 * @param  {Object}  element Jquery element
 * @param  {Number}  offset position to scroll to
 * @return {void}
 */
module.exports.scrollToElement = function scrollToElement(element, offset) {
  $('html, body').animate({
    scrollTop: element.offset().top - (typeof offset !== 'undefined' ? offset : 75)
  }, 300);
};

module.exports.getAndParseCookieName = function getAndParseCookieName(cookieName, defaultValue) {
  var res = Cookies.get(cookieName);
  if (res) {
    return JSON.parse(res);
  } else {
    return defaultValue;
  }
};

/**
 * Returns the current page
 * @return {String} the current page: test, train or use
 */
function currentPage() {
  var href = $(window.location).attr('href');
  return href.substr(href.lastIndexOf('/'));
}
module.exports.currentPage = currentPage;

$(document).ready(function() {
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
  $('.tab-panels--tab').click(function(e) {
    e.preventDefault();
    if (!$(this).hasClass('disabled')) {
      var self = $(this);
      var newPanel = self.attr('href');
      if (newPanel !== currentPage()) {
        window.location = newPanel;
      }
    }
  });

  $.ajaxSetup({
    headers: {
      'csrf-token': $('meta[name="ct"]').attr('content')
    }
  });
});

var positioning = document.querySelector('.positioning-offset');
var top;
$(window).scroll(function() {
  top = positioning.getBoundingClientRect().top;

  if (typeof positioning.getBoundingClientRect() !== 'undefined') {
    if (top < 0) {
      $('.tab-views--tab-list').addClass('stickied');
    } else {
      $('.tab-views--tab-list').removeClass('stickied');
    }
  }
});
