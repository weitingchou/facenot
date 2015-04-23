var log = require('logule').init(module, 'DB');

var dbUrl;
if (process.env.VCAP_SERVICES) {
    var services = JSON.parse(process.env.VCAP_SERVICES);
    if (services['mongolab']) {
        dbUrl = services['mongolab'][0].credentials.uri;
    }
    else if (services['mongodb-2.4']) {
        dbUrl = services['mongodb-2.4'][0].credentials.url;
    }
} else {
    dbUrl = 'mongodb://localhost:27017/';
    //dbUrl = 'mongodb://IbmCloud_dguq383t_b6jk402l_8jnu6bph:G_xCZ4m0i_J1kx3tUt8MWWC7QDstGCpC@ds055190.mongolab.com:55190/IbmCloud_dguq383t_b6jk402l';
}
/*
var dbUrl = process.env.VCAP_SERVICES ?
        JSON.parse(process.env.VCAP_SERVICES)['mongodb-2.4'][0].credentials.url :
        'mongodb://localhost:27017/';
var dbUrl = 'mongodb://08c3db40-a22c-49f5-9e38-3afa0464c1e5:12aae1a4-8990-4972-b398-4a697404715d@23.246.199.78:10096/db';
*/

log.info('Using MongoDB located at %s', dbUrl);

module.exports = {
    dbUrl: dbUrl
};
