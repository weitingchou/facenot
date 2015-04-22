var log = require('logule').init(module, 'DB'),
    config = require('./config'),
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

exports.createDiagnosis = function(userId, arrayOfDiaries, score, report, callback) {
    var diagnosis = new Diagnosis({
        date: new Date(),
        analyzedDiaries: arrayOfDiaries,
        score: score,
        report: report,
        userId: userId
    });
    diagnosis.save(function(err) {
        if (err) { return callback(err, null); }
        callback(null, 'Success');
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
        else if (diagnosis === 'undefined') {
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

exports.deleteAllDiagnoses = function() {
    Diagnosis.remove({}, function(err) {
        if (err) { log.error('Failed to delete all diagnoses, err: '+err); }
    });
};

