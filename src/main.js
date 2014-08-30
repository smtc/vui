var Vue             = require('vue'),
    request         = require('./request'),
    _location       = require('./location'),
    route           = require('./route'),
	utils           = require('./utils'),
    openbox         = require('./components/openbox'),
    loading         = require('./components/loading'),
    message         = require('./components/message'),
    tree            = require('./components/tree'),
    lang            = require('./lang/lang'),
    $data           = {},
    initialized     = false,
    vm

// register prototype
require('./prototype')

var components = {
    'date': require('./components/date'),
    'form': require('./components/form'),
    'form-control': require('./components/form-control'),
    'loading': loading.component,
    'message': message.component,
    'option': require('./components/option'),
    'page': require('./components/page'),
    'pagination': require('./components/pagination'),
    'scope': require('./components/scope'),
    'select': require('./components/select'),
    'tree': tree.tree,
    'tree-folder': tree.folder,
    'tree-file': tree.file
}

function init() {
    if (initialized) return
    initialized = true

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

//set default language
lang.set('zh-cn')

module.exports = {
    request: request,
    utils: utils,
    route: route,
    $data: $data,
    location: _location,
    loading: loading,
    message: message,
    openbox: openbox,
    init: init,
    setLang: lang.set,
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

