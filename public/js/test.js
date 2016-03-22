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

setupTestPanel(result);
