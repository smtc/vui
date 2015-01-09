/* 
 * message { text: '', type: '' }
 */
var lib     = require('../lib'),
    _       = lib.underscore,
    Vue     = lib.Vue,
    utils   = require('../utils'),
    lang    = require('../lang')


var vm = new Vue({
    template:   '<div v-show="messages.length>0">' +
                '<div v-repeat="messages" class="alert alert-{{type}}">' +
                    '<strong>{{time}}</strong><br />' +
                    '{{text}}' +
                    '<button v-on="click: remove(this)" class="close">&times;</button>' +
                '</div>' +
                '</div>',

    replace: true,

    data: function () {
        return {
            messages: []
        }
    },

    methods: {
        remove: function (item) {
            this.messages.$remove(item.$data)
        }
    }

})

module.exports = {
    push: function (msg, type) {
        if ('string' === typeof msg) {
            msg = {
                text: msg || '&nbsp;',
                type: type || 'warning',
                time: utils.formatTime(new Date(), lang.get('datetime.format'))
            }
        }
        vm.messages.push(msg)

        var timeout = msg.timeout || (msg.type === 'danger' ? 0 : 5000)
        if (timeout !== 0)
            setTimeout(function () {
                vm.messages = _.without(vm.messages, msg)
            }, timeout)
    },

    success: function (msg) {
        this.push(msg, 'success')
    },
    
    error: function (msg, status) {
        if (!msg && status)
            msg = lang.get('httpStatus.' + status)
        this.push(msg || "", 'danger')
    },
    
    info: function (msg) {
        this.push(msg, 'info')
    },

    warn: function (msg) {
        this.push(msg, 'warning')
    },

    vm: vm
}


