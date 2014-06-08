var request = require('request'),
    Vue     = require('vue'),
    ui      = require('ui')


new Vue({

    el: 'body',

    directives: {
    },

    filters: {
    },

    components: {
        select: ui.select
    },

    data: {
    }
})


module.exports = {
    request: request,
    Vue: Vue,
    require: function (path) {
        try {
            return require('./' + path)
        } catch (e) {
            return Vue.require(path)
        }
    }
}
