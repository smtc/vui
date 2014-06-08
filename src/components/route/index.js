var utils = require('utils')

var route = module.exports = {
    getRoute: function () {
        var path = location.hash.replace(/^#!\/?/, '') || '/'
        return path
    }

}
