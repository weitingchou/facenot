"use strict";
var extend = require('xtend'),
    user = require('./database_user'),
    diary = require('./database_diary'),
    diagnosis = require('./database_diagnosis');

module.exports = extend(user, diary, diagnosis);
