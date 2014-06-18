var Vue             = require('vue'),
    request         = require('./request'),
    _location       = require('./location'),
    route           = require('./route'),
	utils           = require('./utils'),
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
        scope: require('./components/scope'),
        select: require('./components/select'),
        page: require('./components/page'),
        pagination: require('./components/pagination')
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

