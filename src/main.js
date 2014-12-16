var lib = require('./lib'), 
    utils = require('./utils'),
    route = require('./route'),
    _ = lib.underscore,
    Vue = lib.Vue 

window.Vue = Vue

var directives = {
    href: require('./directives/href')
}

_.each(directives, function (v, k) {
    Vue.directive(k, v)
})

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
