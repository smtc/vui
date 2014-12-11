var lib = require('./lib'), 
    utils = require('./utils'),
    Vue = lib.Vue 

window.Vue = Vue

module.exports = {
    utils: utils,

    request: lib.request,

    underscore: lib.underscore,

    require: function (path) {
        try {
            return require('./' + path)
        } catch (e) {
            return Vue.require(path)
        }
    }
}
