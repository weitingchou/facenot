var db = require('../database'),
    log = require('logule').init(module, 'API Middleware');

exports.authenticate = function(req, res, next) {
    if (req.method === 'OPTIONS') {
        return next();
    }

    function reject_unauthorized(error) {
    }

    var userId = req.param.userId;
    db.getUser(userId, function(err) {
        if (err) {
            if (err.name === 'IDError') {
                var errmsg = 'Authentication failed with error: Unknown user id: '+userId;
                log.error(errmsg);
                res.status(401).send({error: errmsg});
            }
            res.status(500).send({error: 'Internal error'});
        }
        next();
    });
};

exports.addTo = function(router) {
    router.use('', exports.authenticate);
};
