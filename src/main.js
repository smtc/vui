var Vue             = require('vue'),
    request         = require('./request'),
    _location       = require('./location'),
    route           = require('./route'),
	utils           = require('./utils'),
    openbox         = require('./components/openbox'),
    templateCache   = {},
    $data           = {}


new Vue({

    el: 'body',

    methods: {
        openbox: openbox
    },

    directives: {
        href: require('./directives/href')
    },

    filters: {
    },

    components: {
        page: require('./components/page'),
        pagination: require('./components/pagination'),
        scope: require('./components/scope'),
        select: require('./components/select')
    },

    data: $data

})


module.exports = {
    request: request,
    utils: utils,
    route: route,
    $data: $data,
    location: _location,
    openbox: openbox,
    Vue: Vue,
    
    require: function (path) {
        try {
            return require('./' + path)
        } catch (e) {
            return Vue.require(path)
        }
    }
}

