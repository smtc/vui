var lib = require('../lib'),
    _   = lib.underscore,
    url = require('./url'),
    dom = require('./dom'),
    string = require('./string')


module.exports = _.extend({}, url, dom, string)


