var request = require('./request'),
    Vue     = require('vue')

module.exports = {
    request: request,
    Vue: Vue,
    require: function (path) {
        try {
            return require('./' + path)
        } catch (e) {
            return Vue.require(path)
        }
    }
}
