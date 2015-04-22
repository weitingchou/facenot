"use strict";
/**
 * @module watson/routes
 */

var log = require('logule').init(module, 'Watson'),
    AlchemyAPI = require('./alchemyapi'),
    qa = require('./qa');

function allow_methods(methods) {
    return function(req, res) {
        res.set('Allow', methods.join ? methods.join(',') : methods);
        res.send(200);
    };
}

exports.alchemy = function(router) {

    var alchemyapi = new AlchemyAPI();

    function handler(req, res) {
        try {
            var content = req.body.content || undefined;
            if (content) {
                var api = req.originalUrl.split('/')[3];
                log.debug('input api: '+api);
                var options = {};
                switch (api) {
                    case 'keywords':
                        options = {'sentiment': 1};
                        break;
                    case 'sentiment':
                        break;
                    default:
                        var err = new Error('Unknown api: '+api);
                        log.error(err);
                        throw err;
                }
                alchemyapi[api]('text', content, options, function(response) {
                    var result;
                    switch (api) {
                        case 'sentiment':
                            result = response.docSentiment || undefined;
                            break;
                        default:
                            result = response[api] || undefined;
                    }
                    if (result) {
                        res.send(JSON.stringify(result));
                    } else {
                        res.status(500).send(JSON.stringify({error: 'Unable to analyze the content'}));
                    }
                });
            } else {
                res.status(400).send(JSON.stringify({error: 'Bad request, content: '+content}));
            }
        } catch (err) {
            log.error('Unexpected error, err: '+err);
            res.status(500).send({error: 'Interal Error'});
        }
    };

    router.route('/alchemy/keywords')
        .post(handler)
        .options(allow_methods('POST'));

    router.route('/alchemy/sentiment')
        .post(handler)
        .options(allow_methods('POST'));
};

exports.speechToText = function(router) {

    router.route('/speechToText')
        .post(
        function(req, res) {
            // Stone's part
        })
        .options(allow_methods('POST'));
};

exports.qa = function(router) {

    router.route('/qa/simple')
        .post(
        function(req, res) {
            try {
                var question = req.body.question || undefined,
                    timeout = req.body.timeout || 1;
                if (question) {
                    log.info('question: '+question);
                    qa.askSimpleQuestion(question, timeout, function(err, answer) {
                        if (err) {
                            log.error(err);
                            if (err.name === 'EmptyAnswerError') {
                                return res.status(404).send({error: err.message});
                            }
                            return res.status(500).send({error: 'Internal error'});
                        }
                        res.send(200, {result: answer});
                    });
                } else {
                    log.error('Bad request, empty question!');
                    res.status(400).send({error: 'Bad request, empty question'});
                }
            } catch (err) {
                log.error('Unexpected error: '+err);
                res.status(500).send({error: 'Interal Error'});
            }
        })
        .options(allow_methods('POST'));
};

exports.addTo = function(router) {
    this.alchemy(router);
    this.speechToText(router);
    this.qa(router);
};
