var db = require('../database'),
    config =require('./config'),
    jsonPath = require('JSONPath'),
    fd = require('../watson/face_detection'),
    fm = require('../watson/face_model'),
    log = require('logule').init(module, 'API'),
    async = require('async');

db.initCounter();

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
            var diaryId = req.params.diaryId || undefined;
            if (diaryId) {
                db.getDiary(diaryId, function(err, result) {
                    if (err) {
                        log.error(err.message);
                        if (err.name === 'IDError') {
                            return res.status(404).send({error: 'Diary not found'});
                        }
                        return res.status(500).send('Internal error');
                    }
                    res.send({result: {
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
            var diaryId = req.params.diaryId || undefined;
            if (diaryId) {
                async.parallel({
                    deleteDiary: db.deleteDiary(diaryId),
                    deleteDiaryPhoto: db.deleteDiaryPhoto(diaryId)
                }, function(err) {
                    if (err) {
                        log.error(err);
                        return res.status(500).send({error: 'Internal error'});
                    }
                    res.send({result: 'Success'});
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
            var diaryId = req.params.diaryId || undefined;
            if (diaryId) {
                db.getDiaryPhoto(diaryId, function(err, result) {
                    if (err) {
                        log.error(err.message);
                        if (err.name === 'IDError') {
                            return res.status(404).send({error: 'Diary photo not found'});
                        }
                        return res.status(500).send('Internal error');
                    }
                    res.set('Content-Type', 'image/jpg');
                    res.send(result.photo);
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
            var userId = req.params.userId,
                diaryPhoto = jsonPath.eval(req, '$.files.filePic.buffer')[0],
                diaryContent = jsonPath.eval(req, '$.files.fileContent.buffer')[0];

            if (diaryPhoto && diaryContent) {
                if ((diaryPhoto.length === 0) || (diaryContent.length === 0)) {
                    var errmsg = 'Either diary photo or diary content is empty!';
                    log.error(errmsg);
                    return res.status(400).send({error: errmsg});
                }
                fd.detect('image', diaryPhoto, null, function(err, face) {
                    if (err) {
                        log.error('Failed to do face detection, err: '+err);
                        return res.status(500).send({error: 'Internal error'});
                    }
                    var ageRange = jsonPath.eval(face, '$.imageFaces[0].age.ageRange')[0];
                    if (ageRange) {
                        var min = parseInt(ageRange.split('-')[0], 10),
                            max = parseInt(ageRange.split('-')[1], 10),
                            avgAge = ((min + max) / 2).toFixed();
                        fm.detect(face, function(err, faceState) {
                            if (err) {
                                log.error(err);
                                return res.status(500).send({error: 'Internal error'});
                            }
                            async.parallel({
                                countOne: db.increaseCounter.bind(db),
                                createDiary: db.createDiary.bind(db, userId, diaryPhoto, avgAge, diaryContent, faceState)
                            }, function(err, results) {
                                if (err) {
                                    log.error('Failed to create diary, err: '+err);
                                    return res.status(500).send({error: 'Internal error'});
                                }
                                res.send({result: results['createDiary']});
                                var currentCount = results['countOne'];
                                log.info('current count: '+currentCount);
                                log.info('threshold: '+config.diagnoThreshold);
                                if (currentCount >= config.diagnoThreshold) {
                                    log.info('start to generate report!');
                                    async.parallel({
                                        getUndiagnosedDiaries: function(callback) {
                                            db.getUndiagnosedDiaries(userId, function(err, diaries) {
                                                if (err) { return callback(err, null); }
                                                callback(null, diaries);
                                            });
                                        },
                                        resetCounter: db.resetCounter.bind(db)
                                    }, function(err, results) {
                                        if (err) { return log.error(err); }
                                        var diaries = results['getUndiagnosedDiaries'],
                                            faceStates = [],
                                            diaryIds = [];
                                        diaries.forEach(function(diary) {
                                            faceStates.push(diary.analysis.faceState.result);
                                            diaryIds.push(diary._id);
                                        });
                                        fm.genReport(faceStates, function(err, result) {
                                            if (err) { return log.error(err); }
                                            log.info('score: '+result.score);
                                            log.info('report: '+result.report);
                                            db.createDiagnosis(userId,
                                                               diaryIds,
                                                               result.score,
                                                               result.report,
                                                               function(err, diaId) {
                                                                   if (err) {
                                                                       log.error('Failed to create diagnosis record, err: '+err);
                                                                   }
                                                                   log.info('Diagnosis report created: '+diaId);
                                                               });
                                        });
                                    });
                                }
                            });
                        });
                    } else {
                        log.error('Error response from Watson server: '+result);
                        return res.status(500).send({error: 'Internal error'});
                    }
                });
            } else {
                var errmsg = 'Invalid diary request format';
                log.error(errmsg);
                return res.status(400).send({error: errmsg});
            }
        })
        .options(allow_methods('POST'));

    router.route('/:userId/diaries')
        .get(
        function(req, res) {
            var userId = req.params.userId,
                yearmonth = jsonPath.eval(req, '$.query.yearmonth');
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
                    res.send({result: processResult(result)});
                });
            } else {
                db.getAllDiaries(userId, function(err, result) {
                    if (err) {
                        log.error(err);
                        if (err.name === 'NoDiaryError') {
                            return res.status(404).send({error: err.message});
                        }
                        return res.status(500).send({error: 'Internal error'});
                    }
                    res.send({result: processResult(result)});
                });
            }
        })
        .options(allow_methods('GET'));
};

exports.diagnosis = function(router) {

    router.route('/:userId/diagnosis/:diagnosisId')
        .get(
        function(req, res) {
            var diagnosisId = req.params.diagnosisId || undefined;
            if (diagnosisId) {
                db.getDiagnosis(diagnosisId, function(err, result) {
                    if (err) {
                        log.error(err.message);
                        if (err.name === 'IDError') {
                            return res.status(404).send({error: 'Diagnosis not found'});
                        }
                        return res.status(500).send('Internal error');
                    }
                    res.send({result: {
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
            var diagnosisId = req.params.diagnosisId || undefined;
            if (diagnosisId) {
                db.deleteDiagnosis(diagnosisId, function(err) {
                    if (err) {
                        log.error(err);
                        return res.status(500).send({error: 'Internal error'});
                    }
                    res.send('Success');
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
            var userId = req.params.userId,
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
                        res.send({result: processResult(result)});
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
                    res.send({result: processResult(result)});
                });
            }
        })
        .options(allow_methods('GET'));
};

exports.addTo = function(router) {
    this.diary(router);
    this.diagnosis(router);
};
