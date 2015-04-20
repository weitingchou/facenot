"use strict";
var extend = require('xtend'),
    user = require('./database_user'),
    diary = require('./database_diary'),
    report = require('./database_report');

module.exports = extend(user, diary, report);
