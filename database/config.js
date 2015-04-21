var log = require('logule').init(module, 'DB');

var dbUrl = process.env.VCAP_SERVICES ?
        JSON.parse(process.env.VCAP_SERVICES)['mongodb-2.4'][0].credentials.url :
        'mongodb://localhost:27017/';

log.info('Using MongoDB located at %s', dbUrl);

module.exports = {
    dbUrl: dbUrl
};
