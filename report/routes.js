var db = require('../database'),
    log = require('logule').init(module, 'User'),
    async = require('async');

function allow_methods(methods) {
    return function(req, res) {
        res.set('Allow', methods.join ? methods.join(',') : methods);
        res.send(200);
    };
}

exports.user = function(router) {

    router.route('/')
        .get(
        function(req, res) {
            var id = req.query.id || undefined;
            if (id) {
                db.getUser(id, function(err, user) {
                    if (err) {
                        log.error(err.message);
                        if (err.name === 'IDError') {
                            return res.status(404).send({error: 'User not found'});
                        }
                        return res.status(500).send('Internal error');
                    }
                    res.send(200, {result: user});
                });
            } else {
                log.error('Bad request: no user id provided');
                res.status(400).send({error: 'Bad request'});
            }
        })
        .post(function(req, res) {
            function checkBirthFormat(birth) {
                if (birth) {
                    var validator = /^([0-9]{4}[-])([0-9]{2}[-])([0-9]{2})$/i;
                    if (!validator.test(birth)) {
                        return false;
                    } else {
                        return true;
                    }
                }
                return false;
            }

            var name = req.body.name || undefined,
                birth = req.body.birth || undefined,
                email = req.body.email || undefined;

            if (name && checkBirthFormat(birth) && email) {
                var age = Math.floor(((new Date() - new Date(birth.split('-').reverse().join('-'))) / 1000 / (60*60*24)) / 365.25);
                db.createUser(name, birth, age, email, function(err) {
                    if (err) {
                        log.error('Failed to create user: '+email);
                        return res.status(500).send({error: 'Internal error'});
                    }
                    res.send(200, {result: 'Success'});
                });
            } else {
                log.error('Bad request: '+req.body);
                res.status(400).send({error: 'Bad request'});
            }
        })
        .options(allow_methods('GET', 'POST'));
};

exports.addTo = function(router) {
    this.user(router);
};
