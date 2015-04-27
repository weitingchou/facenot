var log = require('logule').init(module, 'Gen'),
    fs = require('fs'),
    async = require('async'),
    request = require('request'),
    host = 'http://facnot.mybluemix.net';
    //host = 'http://localhost:3005';

var user = {
    name: 'Tiffany Wang',
    birth: '1990-04-06',
    email: 'vivianth@tw.ibm.com'
};

function reset(callback) {
    var options = {
        url: host+'/api/reset',
    };
    request.get(options, function(err, res) {
        if (err) {
            log.error(err);
            return callback(err, null);
        }
        callback(null, null);
    });
}

function createUser(name, birth, email, callback) {
    var options = {
        url: host+'/user',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            name: name,
            birth: birth,
            email: email
        })
    };
    request.post(options, function(err, res) {
        if (err) {
            log.error(err);
            return callback(err, null);
        }
        callback(null, null);
    });
}

function createDiaries(callback) {

    function createDiary(date, callback) {
        var formData = {
            filePic: fs.createReadStream(__dirname +'/pictures/'+date+'.jpg'),
            fileContent: fs.createReadStream(__dirname +'/contents/'+date+'.txt')
        };
        request.post({url: host+'/api/'+user.email+'/diary?createon='+date+encodeURIComponent('T20:20:20+08:00'), formData: formData}, function(err) {
            if (err) {
                var errmsg = 'Failed to create diary for date: '+date;
                log.error(errmsg);
                return callback(errmsg, null);
            }
            callback(null, null);
        });
    }

    var diaryDates = ['2015-04-01', '2015-04-03', '2015-04-04', '2015-04-05', '2015-04-07',
                      '2015-04-12', '2015-04-13', '2015-04-16', '2015-04-20', '2015-04-21'];
    //var diaryDates = ['2015-04-16'];
    async.each(diaryDates, function(date, done) {
        createDiary(date, function(err) {
            if (err) { return done(err); }
            done();
        });
    }, function(err) {
        if (err) {
            log.error(err);
            return callback(err, null);
        }
        callback(null, null);
    });
}

async.series([
    function(callback) {
        reset(callback);
    },
    function(callback) {
        createUser(user.name, user.birth, user.email, callback);
    },
    function(callback) {
        createDiaries(callback);
    }
], function(err, results) {
    if (err) { return log.error(err); }
    log.info(results);
});
