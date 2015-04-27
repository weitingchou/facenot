var express = require('express'),
    bodyParser = require('body-parser'),
    multer = require('multer'),
    log = require('logule').init(module, 'App'),
    dye = require('dye'),
    http = require('http'),
    user = require('./user'),
    routes = require('./routes'),
    watson = require('./watson');

var app = express();

function cors(req, res, next) {
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
    res.set('Access-Control-Allow-Headers', 'authorization,content-type');
    res.set('Access-Control-Allow-Credentials', 'true');
    res.set('Allow', 'GET,POST,PUT,DELETE,OPTIONS');
    next();
}
app.use(cors);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(multer({ inMemory: true }));
app.use(express.static(__dirname + "/public"));

app.use(function(req, res, next) {
    res.on('finish', function() {
        var method = res.statusCode < 400 ? dye.green(req.method) : dye.red(req.method);
        log.info('%s %s %d %d', dye.bold(method), req.originalUrl, res.statusCode, res._headers['content-length']);
    });
    res.on('error', function(err) {
        log.error('%s %s %d %s', req.method, req.originalUrl, res.statusCode, err);
    });
    next();
});

app.use('/api/user', user.router);
app.use('/api', routes.router);
app.use('/watson', watson.router);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.send({
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.send({
        message: err.message,
        error: {}
    });
});

var server = http.createServer(app);

exports.app = app;
exports.server = server;
