var log = require('logule').init(module, 'DB'),
    config = require('./config'),
    async = require('async'),
    mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    db = mongoose.createConnection(config.dbUrl);

var DiagnosisSchema = new Schema({
    date: Date,
    analyzedDiaries: [String],
    score: Number,
    report: String,
    userId: String
});
var Diagnosis = db.model('Diagnosis', DiagnosisSchema);

var CounterSchema = new Schema({
    name: {type: String, unique: true},
    count: Number
});
var Counter = db.model('Counter', CounterSchema);

exports.initCounter = function() {
    async.series({
        clean_counter: function(callback) {
            Counter.remove({}, callback);
        },
        init_counter: function(callback) {
            var counter = new Counter({
                name: 'DiaryCounter',
                count: 0
            });
            counter.save(function(err) {
                if (err) { callback(err, null); }
                else { callback(null, null); }
            });
        }
    }, function(err) {
        if (err) { log.error('Failed to initialize diary counter!, err: '+err); }
    });
};

exports.increaseCounter = function(callback) {
    Counter.findOneAndUpdate({name: 'DiaryCounter'}, {$inc: {count: 1}}, {}, function(err, counter) {
        if (err) { return callback(err, null); }
        else if (counter === null) {
            var errmsg = 'The is not initialized yet!';
            log.error(errmsg);
            return callback(errmsg, null);
        }
        callback(null, counter.count);
    });
};

exports.resetCounter = function(callback) {
    Counter.findOneAndUpdate({name: 'DiaryCounter'}, {$set: {count: 0}}, {}, function(err, counter) {
        if (err) { return callback(err, null); }
        else if (counter === null) {
            var errmsg = 'The counter is not initialized yet!';
            log.error(errmsg);
            return callback(errmsg, null);
        } else if (counter.count !== 0) {
            var errmsg = 'Failed to reset counter!';
            log.error(errmsg);
            return callback(errmsg, null);
        }
        callback(null, null);
    });
};

exports.createDiagnosis = function(userId, arrayOfDiaries, score, report, createOn, callback) {
    var targetDate;
    if (createOn) {
        var isoDateValidator = /^([0-9]{4}[-])([0-9]{2}[-])([0-9]{2}[T])([0-9]{2}[:])([0-9]{2}[:])([0-9]{2})$/i;
            isoDateWithTimeZoneValidator = /^([0-9]{4}[-])([0-9]{2}[-])([0-9]{2}[T])([0-9]{2}[:])([0-9]{2}[:])([0-9]{2}[+-])([0-9]{2}[:])([0-9]{2})$/i;
        if (isoDateValidator.test(createOn) ||
            isoDateWithTimeZoneValidator.test(createOn)) {
            targetDate = new Date(Date.parse(createOn));
        } else {
            var errmsg = 'Invalid date format of createOn: '+createOn+', it should be ISO format.';
            log.error(errmsg);
            return callback(errmsg, null);
        }
    } else {
        targetDate = new Date();
    }
    var diagnosis = new Diagnosis({
        date: targetDate,
        analyzedDiaries: arrayOfDiaries,
        score: score,
        report: report,
        userId: userId
    });
    diagnosis.save(function(err) {
        if (err) { return callback(err, null); }
        callback(null, diagnosis._id);
    });
};

exports.getDiagnosisByTime = function(userId, year, month, callback) {
    var start, end;
    switch (month) {
        case 'Jan':
            start = new Date(year, 1, 1);
            end = new Date(year, 1, 31);
            break;
        case 'Feb':
            start = new Date(year, 2, 1);
            end = new Date(year, 2, 28);
            break;
        case 'Mar':
            start = new Date(year, 3, 1);
            end = new Date(year, 3, 31);
            break;
        case 'Apr':
            start = new Date(year, 4, 1);
            end = new Date(year, 4, 30);
            break;
        case 'May':
            start = new Date(year, 5, 1);
            end = new Date(year, 5, 30);
            break;
        case 'Jun':
            start = new Date(year, 6, 1);
            end = new Date(year, 6, 30);
            break;
        case 'Jul':
            start = new Date(year, 7, 1);
            end = new Date(year, 7, 31);
            break;
        case 'Aug':
            start = new Date(year, 8, 1);
            end = new Date(year, 8, 31);
            break;
        case 'Sept':
            start = new Date(year, 9, 1);
            end = new Date(year, 9, 30);
            break;
        case 'Oct':
            start = new Date(year, 10, 1);
            end = new Date(year, 10, 31);
            break;
        case 'Nov':
            start = new Date(year, 11, 1);
            end = new Date(year, 11, 30);
            break;
        case 'Dec':
            start = new Date(year, 12, 1);
            end = new Date(year, 12, 31);
            break;
        default:
            var error = new Error('Invalid month string: '+month);
            return callback(error, null);
    }
    Diagnosis.find({userId: userId, date: {$gte: start, $lte: end}}, function(err, data) {
        if (err) { return callback(err, null); }
        else if (data.length === 0) {
            var error = new Error('No diagnosis found');
            error.name = 'NoDiagnosisError';
            return callback(error, null);
        }
        callback(null, data);
    });
};

exports.getAllDiagnoses = function(userId, callback) {
    Diagnosis.find({userId: userId}, function(err, diagnoses) {
        if (err) { return callback(err, null); }
        else if (diagnoses.length === 0) {
            var error = new Error('No diagnosis found');
            error.name = 'NoDiagnosisError';
            return callback(error, null);
        }
        callback(null, diagnoses);
    });
};

exports.getDiagnosis = function(id, callback) {
    Diagnosis.findOne({_id: id}, function(err, diagnosis) {
        if (err) { return callback(err, null); }
        else if (diagnosis === null) {
            var error = new Error('Diagnosis(s) with the specified id was not found');
            error.name = 'IDError';
            return callback(error, null);
        }
        callback(null, diagnosis);
    });
};

exports.deleteDiagnosis = function(id, callback) {
    Diagnosis.remove({_id: id}, callback);
};

exports.deleteAllDiagnoses = function(callback) {
    Diagnosis.remove({}, function(err) {
        if (err) {
            log.error('Failed to delete all diagnoses, err: '+err); 
            return eallback(err, null);
        }
        callback(null, null);
    });
};

