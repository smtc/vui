var Vue         = require('vue'),
    request     = require('./request'),
    location    = require('./location'),
    route       = require('./route'),
	utils       = require('./utils'),
    ui          = require('./components/ui'),
    gData       = {}


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

    data: gData
})


var vui = module.exports = {
    request: request,
    utils: utils,
    route: route,
    location: location,
    Vue: Vue,
    
    require: function (path) {
        try {
            return require('./' + path)
        } catch (e) {
            return Vue.require(path)
        }
    }
}

