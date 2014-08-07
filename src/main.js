var Vue             = require('vue'),
    request         = require('./request'),
    _location       = require('./location'),
    route           = require('./route'),
	utils           = require('./utils'),
    openbox         = require('./components/openbox'),
    message         = require('./components/message'),
    $data           = {},
    initialized     = false,
    vm

require('./prototype')

var components = {
    'date': require('./components/date'),
    'form': require('./components/form'),
    'form-control': require('./components/form-control'),
    'message': message.component,
    'option': require('./components/option'),
    'page': require('./components/page'),
    'pagination': require('./components/pagination'),
    'scope': require('./components/scope'),
    'select': require('./components/select')
}

function init() {
    if (initialized) return
    initialized = true

    //$data.messages = message.messages

    vm = new Vue({

        el: 'body',

        methods: {
            openbox: openbox
        },

        directives: {
            editable: require('./directives/editable'),
            href: require('./directives/href')
        },

        filters: {
        },

        components: components,

        data: $data

    })
}

// export Vue
window.Vue = Vue

module.exports = {
    request: request,
    utils: utils,
    route: route,
    $data: $data,
    location: _location,
    message: message,
    openbox: openbox,
    init: init,
    Vue: Vue,
    vm: vm,
    
    require: function (path) {
        try {
            return require('./' + path)
        } catch (e) {
            return Vue.require(path)
        }
    }
}

