var fs = require('fs');
var path = require('path');

function lookupName(token) {
  return {
    'moleskine': 'Moleskine Types',
    'dogs': 'Dogs',
    'insurance': 'Insurance',
    'omniearth': 'Satellite Images'
  }[token];
}

function itemPath(kind, item) {
  return './public/images/bundles/' + kind + '/' + item + '.zip';
}

function isNegative(item) {
  return item.match(/^neg/);
}

module.exports.createFormData = function(b) {
  var formData = {
    name: lookupName(b.kind)
  };
  b.bundles.forEach(function(item) {
    var itempath = itemPath(b.kind, item);
    if (isNegative(item)) {
      formData.negative_examples = fs.createReadStream(itempath);
    } else {
      formData[item + '_positive_examples'] = fs.createReadStream(itempath);
    }
  });
  return formData;
};
