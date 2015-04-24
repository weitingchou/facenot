"use sytrict";
var log = require('logule').init(module, 'QA'),
    request = require('request'),
    config = require('./config').qa;
var jsonPath = require("JSONPath");


function isJson(string) {
    try {
        JSON.parse(string);
        return true;
    } catch (e) {
        return false;
    }
}

exports.askSimpleQuestion = function(questionText, timeout, callback) {
    var headers = {
        'Content-Type': 'application/json',
        'X-synctimeout': timeout
    };
    var options = {
        uri: config.url+'/v1/question/healthcare',
        headers: headers,
        auth: {
            user: config.username,
            pass: config.passwd
        },
        body: JSON.stringify({
            question: {
                questionText: questionText
            }
        })
    };
    request.post(options, function(err, res, data) {
        if (err) {
            log.error('Failed to send question to Watson!, err: '+err);
            return callback(err, null);
        }
        try {
            if (data && isJson(data)) {
                var ans = JSON.parse(data);
                if (ans.length === 0) {
                    var error = new Error('No answer found!');
                    error.name = 'EmptyAnswerError';
                    log.error(error);
                    return callback(error, null);
                }
    
                // Process Results
                //result = jsonPath.eval(ans, "$.[0].question.evidencelist[0].text");
                result = ans[0].question.evidencelist[0].text

                //callback(null, ans);
                callback(null, result);
            } else {
                var error = new Error('Not a valid answer: '+body);
                error.name = 'InvalidAnswerError';
                log.error(error);
                callback(error, null);
            }
        } catch (error) {
            log.error('Unexpected error: '+error);
            callback(error, null);
        }
    });
};
