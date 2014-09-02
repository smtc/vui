/* 
 * message { text: '', type: '' }
 */
var utils       = require('../utils'),
    lang        = require('../lang/lang'),
    messages    = []

var component = {
    template:   '<div v-show="messages.length>0">' +
                '<div v-repeat="messages" class="alert alert-{{type}}">' +
                    '<strong>{{time}}</strong><br />' +
                    '{{text}}' +
                    '<button v-on="click: remove(this)" class="close">&times;</button>' +
                '</div>' +
                '</div>',

    replace: true,

    data: {
        messages: messages
    },

    methods: {
        remove: function (item) {
            //utils.arrayRemove(messages, item.$data)
            this.messages.$remove(item.$data)
        }
    }
}

module.exports = {
    push: function (msg, type) {
        if ('string' === typeof msg) {
            msg = {
                text: msg,
                type: type || 'warning',
                time: new Date().format('yyyy-MM-dd hh:mm:ss')
            }
        }
        messages.push(msg)

        var timeout = msg.timeout || (msg.type === 'danger' ? 0 : 5000)
        if (timeout != 0)
            setTimeout(function () {
                utils.arrayRemove(messages, msg)
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
