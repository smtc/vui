var request = require('request'),
    route   = require('route'),
	utils 	= require('utils'),
    ui      = require('ui'),
    Vue     = require('vue'),
    gData  = {}


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
    Vue: Vue,
    
    require: function (path) {
        try {
            return require('./' + path)
        } catch (e) {
            return Vue.require(path)
        }
    }
}

