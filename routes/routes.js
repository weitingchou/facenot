var db = require('../database'),
    log = require('logule').init(module, 'User'),
    async = require('async');

function allow_methods(methods) {
    return function(req, res) {
        res.set('Allow', methods.join ? methods.join(',') : methods);
        res.send(200);
    };
}

exports.diagnosis = function(router) {

    router.route('/:userId/diagnosis/:diagnosisId')
        .get(
        function(req, res) {
            var id = req.query.id || undefined;
            if (id) {
                db.getUser(id, function(err, user) {
                    if (err) {
                        log.error(err.message);
                        if (err.name === 'IDError') {
                            return res.status(404).send({error: 'User not found'});
                        }
                        return res.status(500).send('Internal error');
                    }
                    res.send(200, {result: user});
                });
            } else {
                log.error('Bad request: no user id provided');
                res.status(400).send({error: 'Bad request'});
            }
        })
        .options(allow_methods('GET'));

    router.route('/:userId/diagnoses')
        .get(function(req, res) {
            var userId = req.param.userId,
                query = req.query || undefined;
            if (query) {
                var yearmonth = query.yearmonth || undefined;
                if (yearmonth) {
                } else {

                }
            } else {
                db.getAllDiagnoses(userId, function(err, diagnoses) {
                    if (err) {
                        log.error(err);
                        if (err.name === 'NoDiagnosisError') {
                            return res.status(404).send({error: err.message});
                        }
                        return res.status(500).send({error: 'Internal error'});
                    }
                    res.send(200, {result: diagnoses});
                });
            }
        })
        .options(allow_methods('GET'));
};

exports.addTo = function(router) {
    this.diagnosis(router);
};
