var lib     = require('./lib'), 
    utils   = require('./utils'),
    route   = require('./route'),
    _       = lib.underscore,
    lang    = require('./lang'),
    loading = require('./service/loading'),
    message = require('./service/message'),
    Vue     = lib.Vue 

// set language
lang.set(require('./lang/zh-cn'))

// components ======================================================
var components = {
    date: require('./components/date'),
    loading: loading.component,
    message: message.component,
    'mult-select': require('./components/mult-select'),
    radio: require('./components/option').radio,
    checkbox: require('./components/option').checkbox,
    select: require('./components/select')
}

_.each(components, function (v, k) {
    Vue.component(k, v)
})

// filters =========================================================

// directives ======================================================
var directives = {
    href: require('./directives/href')
}

_.each(directives, function (v, k) {
    Vue.directive(k, v)
})

// exports =========================================================

window.Vue = Vue

module.exports = {
    utils: utils,
    route: route,
    request: lib.request,
    underscore: lib.underscore,
    message: message,
    loading: loading,

    require: function (path) {
        try {
            return require('./' + path)
        } catch (e) {
            return Vue.require(path)
        }
    }
}
