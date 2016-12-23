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

function calculateScaleFactor(imagedata, maxSize) {
  let largest = imagedata.height > imagedata.width ? imagedata.height : imagedata.width;
  let ratio = maxSize / largest;
  return ratio >= 1 ? 1 : ratio;
}

function applyActions(imagedata, flipDimensions, transformFunc) {
  let c = window.document.createElement('canvas');
  if (flipDimensions) {
    c.width = imagedata.height;
    c.height = imagedata.width;
  } else {
    c.height = imagedata.height;
    c.width = imagedata.width;
  }
  var ctx = c.getContext('2d');
  typeof transformFunc === "function" && transformFunc(ctx);

  ctx.drawImage(imagedata,0,0,imagedata.width, imagedata.height);
  return c.toDataURL('image/jpeg');
}

function portraitNormal(imagedat, maxSize) {
  return applyActions(imagedat,false,function(ctx) {
    let scaleFactor = calculateScaleFactor(imagedat, maxSize);
    ctx.canvas.width = ctx.canvas.width * scaleFactor;
    ctx.canvas.height = ctx.canvas.height * scaleFactor;
    ctx.transform(1 * scaleFactor,
                  0,
                  0,
                  1 * scaleFactor,
                  0,
                  0);
  });
}

function portraitO2(imagedat, maxSize) {
  return applyActions(imagedat,false, function(ctx) {
    let scaleFactor = calculateScaleFactor(imagedat, maxSize);
    ctx.canvas.width = ctx.canvas.width * scaleFactor;
    ctx.canvas.height = ctx.canvas.height * scaleFactor;
    ctx.transform(-1 * scaleFactor,
                  0,
                  0,
                  1 * scaleFactor,
                  imagedat.width * scaleFactor,
                  0);
  });
}

function portraitO3(imagedat, maxSize) {
    return applyActions(imagedat,false, function(ctx) {
      let scaleFactor = calculateScaleFactor(imagedat, maxSize);
      ctx.canvas.width = ctx.canvas.width * scaleFactor;
      ctx.canvas.height = ctx.canvas.height * scaleFactor;
      ctx.transform(-1 * scaleFactor,
                    0,
                    0,
                    -1 * scaleFactor,
                    imagedat.width * scaleFactor,
                    imagedat.height * scaleFactor);
  });
}

function portraitO4(imagedat, maxSize) {
   return applyActions(imagedat,false, function(ctx) {
     let scaleFactor = calculateScaleFactor(imagedat, maxSize);
     ctx.canvas.width = ctx.canvas.width * scaleFactor;
     ctx.canvas.height = ctx.canvas.height * scaleFactor;
     ctx.transform(scaleFactor,
                   0,
                   0,
                   -1 * scaleFactor,
                   0,
                   imagedat.height * scaleFactor );
   });
}

function portraitO5(imagedat, maxSize) {
  return applyActions(imagedat,true, function(ctx) {
    let scaleFactor = calculateScaleFactor(imagedat, maxSize);
    ctx.canvas.width = ctx.canvas.width * scaleFactor;
    ctx.canvas.height = ctx.canvas.height * scaleFactor;
    ctx.transform(0, 1 * scaleFactor, 1 * scaleFactor, 0, 0, 0);
  });
}

function portraitO6(imagedat, maxSize) {
  return applyActions(imagedat,true, function(ctx) {
    let scaleFactor = calculateScaleFactor(imagedat, maxSize);
    ctx.canvas.width = ctx.canvas.width * scaleFactor;
    ctx.canvas.height = ctx.canvas.height * scaleFactor;
    ctx.transform(0, 1 * scaleFactor, -1 * scaleFactor, 0, imagedat.height * scaleFactor, 0);
  });
}

function portraitO7(imagedat, maxSize) {
  return applyActions(imagedat,true, function(ctx) {
    let scaleFactor = calculateScaleFactor(imagedat, maxSize);
    ctx.canvas.width = ctx.canvas.width * scaleFactor;
    ctx.canvas.height = ctx.canvas.height * scaleFactor;
    ctx.transform(0, -1 * scaleFactor, -1 * scaleFactor, 0, imagedat.height * scaleFactor , imagedat.width * scaleFactor);
  });
}

function portraitO8(imagedat, maxSize) {
  return applyActions(imagedat,true, function(ctx) {
    let scaleFactor = calculateScaleFactor(imagedat, maxSize);
    ctx.canvas.width = ctx.canvas.width * scaleFactor;
    ctx.canvas.height = ctx.canvas.height * scaleFactor;
    ctx.transform(0, -1 * scaleFactor, 1 * scaleFactor, 0, 0, imagedat.width * scaleFactor);
  });
}

/**
 * Resizes an image
 * @param  {String} image   The base64 image
 * @param  {int} maxSize maximum size
 * @return {String}         The base64 resized image
 */
module.exports.resize = function(image, maxSize) {
  var imageurl = null;
  // eslint-disable-next-line
  EXIF.getData(image, function() {
    // eslint-disable-next-line
    let orientation = EXIF.getTag(this, 'Orientation');
      switch (orientation) {
        default: imageurl = portraitNormal(image,maxSize); break;
        case 2: imageurl = portraitO2(image, maxSize); break;
        case 3: imageurl = portraitO3(image, maxSize); break;
        case 4: imageurl = portraitO4(image, maxSize); break;
        case 5: imageurl = portraitO5(image, maxSize); break;
        case 6: imageurl = portraitO6(image, maxSize); break;
        case 7: imageurl = portraitO7(image, maxSize); break;
        case 8: imageurl = portraitO8(image, maxSize); break;
      }
    });
  return imageurl ? imageurl : portraitNormal(image,maxSize);
}

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
 * @param  {Number}  [offset=75] how much padding to leave above the element (px)
 * @return {void}
 */
module.exports.scrollToElement = function scrollToElement(element, offset=75) {
  $('html, body').animate({
    scrollTop: element.offset().top - offset
  }, 300);
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
$(window).scroll(function() {
  if (positioning && typeof(positioning.getBoundingClientRect()) !== 'undefined') {
    if (positioning.getBoundingClientRect().top < 0) {
      $('.tab-views--tab-list').addClass('stickied');
    } else {
      $('.tab-views--tab-list').removeClass('stickied');
    }
  }
});
