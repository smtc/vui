var Vue             = require('vue'),
    request         = require('./request'),
    _location       = require('./location'),
    route           = require('./route'),
	utils           = require('./utils'),
    ui              = require('./components/ui'),
    templateCache   = {},
    $data          = {}


new Vue({

    el: 'body',

    directives: {
        href: require('./directives/href')
    },

    filters: {
    },

    components: {
        select: ui.select
    },

    data: $data

})


module.exports = {
    request: request,
    utils: utils,
    route: route,
    $data: $data,
    location: _location,
    Vue: Vue,
    
    require: function (path) {
        try {
            return require('./' + path)
        } catch (e) {
            return Vue.require(path)
        }
    }
}

