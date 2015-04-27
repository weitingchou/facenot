var log = require('logule').init(module, 'DB'),
    config = require('./config'),
    async = require('async'),
    mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    db = mongoose.createConnection(config.dbUrl);

var DiarySchema = new Schema({
    date: Date,
    content: String,
    analysis: {
        age: Number,
        faceState: Object
    },
    diagonsed: Boolean,
    userId: String
});
var Diary = db.model('Diary', DiarySchema);

var DiaryPhotoSchema = new Schema({
    diaryId: { type: String, unique: true },
    photo: Buffer
});
var DiaryPhoto = db.model('DiaryPhoto', DiaryPhotoSchema);

exports.createDiary = function(userId, photoBuf, photoAge, content, faceState, createOn, callback) {
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
    var diary = new Diary({
        date: targetDate,
        content: content,
        analysis: {
            age: photoAge,
            faceState: faceState
        },
        diagonsed: false,
        userId: userId
    });
    var photo = new DiaryPhoto({
        diaryId: diary._id,
        photo: photoBuf
    });

    log.info('faceState: '+JSON.stringify(faceState));
    async.each([diary, photo], function(data, done) {
        data.save(function(err) {
            if (err) { return done(err, null); }
            done(null, null);
        });
    }, function(err) {
        if (err) { return callback(err, null); }
        callback(null, diary._id);
    });
};

exports.createDiaryWithDate = function(userId, photoBuf, photoAge, content, dateOffset, callback) {

    var date = new Date();
    var diary = new Diary({
        date: new Date(date.setDate(date.getDate()+dateOffset)),
        content: content,
        analysis: {
            age: photoAge
        },
        userId: userId
    });
    var photo = new DiaryPhoto({
        diaryId: diary._id,
        photo: photoBuf
    });

    async.each([diary, photo], function(data, done) {
        data.save(function(err) {
            if (err) { return done(err, null); }
            done(null, null);
        });
    }, function(err) {
        if (err) { return callback(err, null); }
        callback(null, diary._id);
    });
};

exports.getDiaryByTime = function(userId, year, month, callback) {
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
    Diary.find({userId: userId, date: {$gte: start, $lte: end}}, function(err, data) {
        if (err) { return callback(err, null); }
        else if (data.length === 0) {
            var error = new Error('Diaries with the specified month was not found');
            error.name = 'NoDiaryError';
            return callback(error, null);
        }
        callback(null, data);
    });
};

exports.getAllDiaries = function(userId, callback) {
    Diary.find({userId: userId}, function(err, data) {
        if (err) { return callback(err, null); }
        else if (data.length === 0) {
            var error = new Error('No diary found');
            error.name = 'NoDiaryError';
            return callback(error, null);
        }
        callback(null, data);
    });
};

exports.getDiary = function(id, callback) {
    Diary.findOne({_id: id}, function(err, diary) {
        if (err) { return callback(err, null); }
        else if (diary === null) {
            var error = new Error('Diaries with the specified id was not found');
            error.name = 'IDError';
            return callback(error, null);
        }
        callback(null, diary);
    });
};

exports.getUndiagnosedDiaries = function(userId, callback) {
    Diary.find({userId: userId, diagonsed: false}, function(err, diaries) {
        if (err) { return callback(err, null); }
        else if (diaries.length === 0) {
            var error = new Error('No diary found');
            error.name = 'NoDiaryFound';
            return callback(error, null);
        }
        callback(null, diaries);
    });
};

exports.getDiaryPhoto = function(diaryId, callback) {
    DiaryPhoto.findOne({diaryId: diaryId}, function(err, photo) {
        if (err) { return callback(err, null); }
        else if (photo === null) {
            var error = new Error('Photo with the specified diary id was not found');
            error.name = 'IDError';
            return callback(error, null);
        }
        callback(null, photo);
    });
};

exports.markDiagnosisCompleted = function(id, callback) {
    Diary.findOneAndUpdate({_id: id}, {$set: {diagonsed: true}}, {}, function(err) {
        if (err) { return callback(err, null); }
        callback(null, null);
    });
};

exports.deleteDiary = function(id, callback) {
    Diary.remove({_id: id}, callback);
};

exports.deleteDiaryPhoto = function(diaryId, callback) {
    DiaryPhoto.remove({diaryId: diaryId}, callback);
};

exports.deleteAllDiaries = function(callback) {
    Diary.remove({}, function(err) {
        if (err) {
            log.error('Failed to delete all diaries, err: '+err);
            return callback(err, null);
        }
        callback(null, null);
    });
};

exports.deleteAllDiaryPhotos = function(callback) {
    DiaryPhoto.remove({}, function(err) {
        if (err) {
            log.error('Failed to delete all diary photos, err: '+err);
            return callback(err, null);
        }
        callback(null, null);
    });
};
