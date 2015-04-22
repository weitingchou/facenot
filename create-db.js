var db = require('./database'),
    async = require('async');

async.series({
    deleteAllUsers: db.deleteAllUsers.bind(db),
    deleteAllDiaries: db.deleteAllDiaries.bind(db),
    deleteAllDignoses: db.deleteAllDiagnoses.bind(db),
    addUser: db.createUser.bind(db, 'Richard', '')
});
