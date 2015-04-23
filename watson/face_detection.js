var log = require('logule').init(module, 'Face Detect'),
    fs = require('fs'),
    request = require('request');

var endpoint = {
    image: 'http://access.alchemyapi.com/calls/image/ImageGetRankedImageFaceTags',
    url: 'http://access.alchemyapi.com/calls/url/URLGetRankedImageFaceTags'
};

var apikey = '0949ce6bc6ad4ad145b0929d25b01859378d6969';

function isJson(string) {
    try {
        JSON.parse(string);
        return true;
    } catch (e) {
        return false;
    }
}

exports.detect = function(flavor, data, params, callback) {
    var url = endpoint[flavor] || undefined,
        urlKVPairs = [];

    params = params || {};
    params['apikey'] = apikey;
    params['outputMode'] = 'json';
    params['imagePostMode'] = 'raw';
    Object.keys(params).forEach(function(key) {
        urlKVPairs.push(key+'='+encodeURIComponent(params[key]));
    });

    if (url) {
        var options = {
            uri: url+'?'+urlKVPairs.join('&'),
            headers: {
                'Content-Length': data.length
            },
            body: data
        };
        request.post(options, function(err, res, body) {
            if (err) {
                log.error(err);
                return callback(err, null);
            }
            try {
                if (body && isJson(body)) {
                    callback(null, JSON.parse(body));
                } else {
                    var error = new Error('Not a valid answer from Watson.');
                    error.name = 'InvalidAnswerError';
                    log.error(error);
                    callback(error, null);
                }
            } catch (error) {
                log.error('Unexpected error: '+error);
                callback(error, null);
            }
        });
    } else {
        callback('Unsupport flavor: '+flavor, null);
    }
};
