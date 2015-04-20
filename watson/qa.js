"use strict";
var request = require('request'),
    config = require('./config');

exports.askSimpleQuestion = function(question, timeout, callback) {
    var headers = {
        'Content-Type': 'application/json',
        'X-synctimeout': timeout,
    };
    var options = {
        headers: headers,
        auth: {
            user: username,
            pass: password
        }
    }
    request.post()
};
