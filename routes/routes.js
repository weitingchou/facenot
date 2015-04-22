var db = require('../database'),
    adminId = require('../user/config').administratorId,
    log = require('logule').init(module, 'User'),
    async = require('async');

function allow_methods(methods) {
    return function(req, res) {
        res.set('Allow', methods.join ? methods.join(',') : methods);
        res.send(200);
    };
}

function processResult(result) {
    var processed = [];
    result.forEach(function(item) {
        processed.push({
            id: item._id,
            date: item.date
        });
    });
    processed.sort(function(a, b) {
        return new Date(b.date) - new Date(a.date);
    });
    return processed;
}

exports.diary = function(router) {

    router.route('/:userId/diary/:diaryId')
        .get(
        function(req, res) {
            var diaryId = req.param.diaryId || undefined;
            if (diaryId) {
                db.getDiary(diaryId, function(err, result) {
                    if (err) {
                        log.error(err.message);
                        if (err.name === 'IDError') {
                            return res.status(404).send({error: 'Diary not found'});
                        }
                        return res.status(500).send('Internal error');
                    }
                    res.send(200, {result: {
                        date: result.date,
                        content: result.content,
                        analysis: {
                            age: result.analysis.age
                        }
                    }});
                });
            } else {
                log.error('Bad request: no diary id is provided');
                res.status(400).send({error: 'Bad request'});
            }
        })
        .put(
        function(req, res) {
            // update diary
        })
        .delete(
        function(req, res) {
            var diaryId = req.param.diaryId || undefined;
            if (diaryId) {
                async.parallel({
                    deleteDiary: db.deleteDiary(diaryId),
                    deleteDiaryPhoto: db.deleteDiaryPhoto(diaryId)
                }, function(err) {
                    if (err) {
                        log.error(err);
                        return res.status(500).send({error: 'Internal error'});
                    }
                    res.send(200, 'Success');
                });
            } else {
                log.error('Bad request: no diary id is provided');
                res.status(400).send({error: 'Bad request'});
            }
        })
        .options(allow_methods('GET', 'PUT', 'DELETE'));

    router.route('/:userId/diaryphoto/:diaryId')
        .get(
        function(req, res) {
            var diaryId = req.param.diaryId || undefined;
            if (diaryId) {
                db.getDiaryPhoto(diaryId, function(err, result) {
                    if (err) {
                        log.error(err.message);
                        if (err.name === 'IDError') {
                            return res.status(404).send({error: 'Diary photo not found'});
                        }
                        return res.status(500).send('Internal error');
                    }
                    res.set('Content-Tpye', 'image/jpeg');
                    res.send(200, result);
                });
            } else {
                log.error('Bad request: no diary id is provided');
                res.status(400).send({error: 'Bad request'});
            }
        })
        .options(allow_methods('GET'));

    router.route('/:userId/diary')
        .post(
        function(req, res) {
            // Stone's part
        })
        .options(allow_methods('POST'));

    router.route('/:userId/diaries')
        .get(
        function(req, res) {
            var userId = req.param.userId,
                query = req.query || undefined;
            if (query) {
                var yearmonth = query.yearmonth || undefined;
                if (yearmonth) {
                    var year = yearmonth.split('-')[0] || undefined,
                        month = yearmonth.split('-')[1] || undefined;
                    db.getDiaryByTime(userId, year, month, function(err, result) {
                        if (err) {
                            log.error(err);
                            if (err.name === 'NoDiaryError') {
                                return res.status(404).send({error: err.message});
                            }
                            return res.status(500).send({error: 'Internal error'});
                        }
                        res.send(200, {result: processResult(result)});
                    });
                } else {
                    log.error('Unknown query string: '+query);
                    res.status(400).send({error: 'Bad request'});
                }
            } else {
                db.getAllDiaries(userId, function(err, result) {
                    if (err) {
                        log.error(err);
                        if (err.name === 'NoDiaryError') {
                            return res.status(404).send({error: err.message});
                        }
                        return res.status(500).send({error: 'Internal error'});
                    }
                    res.send(200, {result: processResult(result)});
                });
            }
        })
        .options(allow_methods('GET'));
};

exports.diagnosis = function(router) {

    router.route('/:userId/diagnosis/:diagnosisId')
        .get(
        function(req, res) {
            var diagnosisId = req.param.diagnosisId || undefined;
            if (diagnosisId) {
                db.getDiagnosis(diagnosisId, function(err, result) {
                    if (err) {
                        log.error(err.message);
                        if (err.name === 'IDError') {
                            return res.status(404).send({error: 'Diagnosis not found'});
                        }
                        return res.status(500).send('Internal error');
                    }
                    res.send(200, {result: {
                        date: result.date,
                        score: result.score,
                        report: result.report,
                        diaries: result.analyzedDiaries
                    }});
                });
            } else {
                log.error('Bad request: no diagnosis id is provided');
                res.status(400).send({error: 'Bad request'});
            }
        })
        .delete(
        function(req, res) {
            var diagnosisId = req.param.diagnosisId || undefined;
            if (diagnosisId) {
                db.deleteDiagnosis(diagnosisId, function(err) {
                    if (err) {
                        log.error(err);
                        return res.status(500).send({error: 'Internal error'});
                    }
                    res.send(200, 'Success');
                });
            } else {
                log.error('Bad request: no diagnosis id is provided');
                res.status(400).send({error: 'Bad request'});
            }
        })
        .options(allow_methods('GET', 'DELETE'));

    router.route('/:userId/diagnoses')
        .get(
        function(req, res) {
            var userId = req.param.userId,
                query = req.query || undefined;
            if (query) {
                var yearmonth = query.yearmonth || undefined;
                if (yearmonth) {
                    var year = yearmonth.split('-')[0] || undefined,
                        month = yearmonth.split('-')[1] || undefined;
                    db.getDiagnosisByTime(userId, year, month, function(err, result) {
                        if (err) {
                            log.error(err);
                            if (err.name === 'NoDiagnosisError') {
                                return res.status(404).send({error: err.message});
                            }
                            return res.status(500).send({error: 'Internal error'});
                        }
                        res.send(200, {result: processResult(result)});
                    });
                } else {
                    log.error('Unknown query string: '+query);
                    res.status(400).send({error: 'Bad request'});
                }
            } else {
                db.getAllDiagnoses(userId, function(err, result) {
                    if (err) {
                        log.error(err);
                        if (err.name === 'NoDiagnosisError') {
                            return res.status(404).send({error: err.message});
                        }
                        return res.status(500).send({error: 'Internal error'});
                    }
                    res.send(200, {result: processResult(result)});
                });
            }
        })
        .options(allow_methods('GET'));
};

exports.admin = function(router) {

    router.route('/:userId/reset')
        .get(
        function(req, res) {
            var userId = req.param.userId;
            if (userId === adminId) {
                async.series({
                    cleanDiaries: db.deleteAllDiaries(),
                    cleanDiagnoses: db.deleteAllDiagnoses()
                }, function(err) {
                    if (err) { return res.status(500).send({error: err}); }
                    res.send(200, 'Success');
                });
            }
        })
        .options(allow_methods('GET'));
};

exports.addTo = function(router) {
    this.diary(router);
    this.diagnosis(router);
};
