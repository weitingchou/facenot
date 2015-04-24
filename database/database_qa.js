var log = require('logule').init(module, 'DB'),
    config = require('./config'),
    mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    db = mongoose.createConnection(config.dbUrl);

var QASchema = new Schema({
    date: Date,
    question: String,
    answer: String,
    userId: String
});
var QA = db.model('QA', QASchema);

exports.createQA = function(userId, question, answer, callback) {
    var qa = new QA({
        date: new Date().getTime(),
        question: question,
        answer: answer,
        userId: userId
    });
    qa.save(function(err) {
        if (err) { return callback(err, null); }
        callback(null, qa._id);
    });
};

exports.getAllQA = function(userId, callback) {
    QA.find({userId: userId}, function(err, result) {
        if (err) { return callback(err, null); }
        else if (result.length === 0) {
            var error = new Error('No qa found');
            error.name = 'NoQAError';
            return callback(error, null);
        }
        callback(null, result);
    });
};

exports.getLatestQA = function(userId, limit, callback) {
    QA.find({userId: userId})
        .sort({date: -1})
        .limit(limit)
        .exec(function(err, result) {
            if (err) { return callback(err, null); }
            else if (result.length === 0) {
                var error = new Error('No qa found');
                error.name = 'NoQAError';
                return callback(error, null);
            }
            callback(null, result);
        });
};

exports.getQA = function(id, callback) {
    QA.findOne({_id: id}, function(err, qa) {
        if (err) { return callback(err, null); }
        else if (qa === null) {
            var error = new Error('QA(s) with the specified id was not found');
            error.name = 'IDError';
            return callback(error, null);
        }
        callback(null, qa);
    });
};

exports.deleteQA = function(id, callback) {
    QA.remove({_id: id}, callback);
};

exports.deleteAllQA = function() {
    QA.remove({}, function(err) {
        if (err) { log.error('Failed to delete all qa, err: '+err); }
    });
};

