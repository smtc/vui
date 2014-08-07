/* 
 * message { text: '', type: '' }
 */
var utils       = require('../utils'),
    messages    = []

var component = {
    template: require('./message.html'),

    data: {
        messages: messages
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
                text: msg,
                type: type || 'warning',
                time: new Date().format('yyyy-MM-dd hh-mm-ss')
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
    
    error: function (msg) {
        this.push(msg, 'danger')
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
