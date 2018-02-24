var request = require('request');
var vcapServices = require('vcap_services');

module.exports.detectFaces = function(params, callback) {
  var api_key = null
  if(process.env.VCAP_SERVICES) {
    var credentials = vcapServices.getCredentials('watson_vision_combined')
    api_key = credentials.api_key
  } else {
    api_key = process.env.VISUAL_RECOGNITION_API_KEY
  }
  var options = {
    url: `https://gateway-a.watsonplatform.net/visual-recognition/api/v3/detect_faces_beta?api_key=${api_key}&version=2016-05-17`,
  }

  if(params.images_file) {
    options.method = 'POST'
    options.formData = {
      images_file: params.images_file
    }
  } else {
    options.method = 'GET'
    options.url += `&url=${params.url}`
  }
  var req = request(options, (err, res, body) => {
    if (err) {
        callback(err)
    }
    callback(null, JSON.parse(body))
  });
}
