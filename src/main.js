var lib = require('./lib'), 
    utils = require('./utils'),
    route = require('./route'),
    Vue = lib.Vue 

window.Vue = Vue

module.exports = {
    utils: utils,

    route: route,

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
