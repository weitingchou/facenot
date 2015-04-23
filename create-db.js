var db = require('./database'),
    fs = require('fs'),
    async = require('async');

var photo = fs.readFileSync('./Richard.jpg'),
    text = fs.readFileSync('./diary.txt');
async.series({
    //deleteAllUsers: db.deleteAllUsers.bind(db),
    //deleteAllDiaries: db.deleteAllDiaries.bind(db),
    //deleteAllDignoses: db.deleteAllDiagnoses.bind(db),
    //getUser: db.getUser.bind(db, 'richchou@tw.ibm.com'),
    //createUser: db.createUser.bind(db, 'Richard', '1983-12-09', 31, 'richchou@tw.ibm.com'),
    //getAllUsers: db.getAllUsers.bind(db),
    getAllDiagnoses: db.getAllDiagnoses.bind(db, 'richchou@tw.ibm.com'),
    //getDiagnosis: db.getDiagnosis.bind(db, '5538f950521ce175c0000006'),
    //createDiary1: db.createDiaryWithDate.bind(db, 'richchou@tw.ibm.com', photo, 21, text, -2),
    //createDiary2: db.createDiaryWithDate.bind(db, 'richchou@tw.ibm.com', photo, 21, text, -3),
    //createDiary3: db.createDiaryWithDate.bind(db, 'richchou@tw.ibm.com', photo, 21, text, -5),
    //createDiary4: db.createDiaryWithDate.bind(db, 'richchou@tw.ibm.com', photo, 21, text, -7),
    //createDiary5: db.createDiaryWithDate.bind(db, 'richchou@tw.ibm.com', photo, 21, text, -11)
}, function(err, results) {
    if (err) { return console.log(err); }
    console.log(results);
});
