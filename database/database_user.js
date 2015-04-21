var log = require('logule').init(module, 'DB'),
    config = require('./config'),
    mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    db = mongoose.createConnection(config.dbUrl);

var UserSchema = new Schema({
    name: String,
    birth: Date,
    age: Number,
    id: {type: String, unique: true}
});
var User = db.model('User', UserSchema);

exports.createUser = function(name, birth, age, id, callback) {
    var user = new User({
        name: name,
        birth: birth,
        age: age,
        id: id
    });
    user.save(function(err) {
        if (err) { return callback(err, null); }
        callback(null, 'Success');
    });
};

exports.getUser = function(id, callback) {
    User.findOne({id: id}, function(err, user) {
        if (err) { return callback(err, null); }
        else if (user === 'undefined') {
            var error = new Error('User with the specified id address was not found');
            error.name = 'IDError';
            callback(error, null);
        }
        callback(null, user);
    });
};

exports.deleteUser = function(id, callback) {
    User.remove({id: id}, callback);
};

exports.deleteAllUsers = function() {
    User.remove({}, function(err) {
        if (err) { log.error('Failed to delete all users, err: '+err); }
    });
};

