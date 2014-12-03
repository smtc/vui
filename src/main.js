var lib = require('./lib'), 
    utils = require('./utils'),
    Vue = lib.Vue 


module.exports = {
    utils: utils,

    require: function (path) {
        try {
            return require('./' + path)
        } catch (e) {
            return Vue.require(path)
        }
    }
}
