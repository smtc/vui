/* 
 * message { text: '', type: '' }
 */
var _        = require('../lib').underscore,
    utils    = require('../utils'),
    lang     = require('../lang'),
    messages = []

var component = {
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
            messages: messages
        }
    },

    methods: {
        remove: function (item) {
            this.messages.$remove(item.$data)
        }
    }
}

module.exports = {
    push: function (msg, type) {
        if ('string' === typeof msg) {
            msg = {
                text: msg || '&nbsp;',
                type: type || 'warning',
                time: utils.formatTime(new Date(), lang.get('datetime.format'))
            }
        }
        messages.push(msg)

        var timeout = msg.timeout || (msg.type === 'danger' ? 0 : 5000)
        if (timeout !== 0)
            setTimeout(function () {
                messages = _.without(messages, msg)
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
    
    messages: messages,

    component: component
}
