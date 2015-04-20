var log = require('logule').init(module, 'DB'),
    config = require('./config'),
    mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    db = mongoose.createConnection(config.dbUrl);

var ReportSchema = new Schema({
    date: Date,
    score: Number,
    content: String,
    treatment: String,
    action: String,
    userEmail: String
});
var Report = db.model('Report', ReportSchema);

exports.createReport = function(score, content, treatment, action, userEmail, callback) {
    var report = new Report({
        date: new Date(),
        score: score,
        content: content,
        treatment: treatment,
        action: action,
        userEmail: userEmail
    });
    report.save(function(err) {
        if (err) { return callback(err, null); }
        callback(null, 'Success');
    });
};

exports.getReportByTime = function(userEmail, year, month, callback) {
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
    Report.find({email: email, date: {$gte: start, $lte: end}}, function(err, data) {
        if (err) { return callback(err, null); }
        else if (data.length === 0) {
            var error = new Error('Report(s) with the specified month was not found');
            error.name = 'NoReportError';
            return callback(error, null);
        }
        callback(null, data);
    });
};

exports.getReport = function(id, callback) {
    Report.findOne({_id: id}, function(err, report) {
        if (err) { return callback(err, null); }
        else if (diary === 'undefined') {
            var error = new Error('Report(s) with the specified id was not found');
            error.name = 'IDError';
            return callback(error, null);
        }
        callback(null, report);
    });
};

exports.deleteReport = function(id, callback) {
    Report.remove({_id: id}, callback);
};

exports.deleteAllDiaries = function() {
    Report.remove({}, function(err) {
        if (err) { log.error('Failed to delete all reports, err: '+err); }
    });
};

