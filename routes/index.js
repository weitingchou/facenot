"use strict";

var express = require('express');

exports.routes = require('./routes.js');
exports.middleware = require('./middleware.js');

exports.router = express.Router();

exports.middleware.addTo(exports.router);
exports.routes.addTo(exports.router);
