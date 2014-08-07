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
    push: function (msg) {
        var t = typeof msg
        if (t === 'string')
            messages.push({
                text: msg,
                type: 'warning',
                time: new Date().format('yyyy-MM-dd hh-mm-ss')
            })
        else
            messages.push(msg)
    },

    add: function (msg, type) {
        this.push({
            text: msg,
            type: type,
            time: new Date().format('yyyy-MM-dd hh-mm-ss')
        })
    },

    success: function (msg) {
        this.add(msg, 'success')
    },
    
    error: function (msg) {
        this.add(msg, 'danger')
    },
    
    info: function (msg) {
        this.add(msg, 'info')
    },

    warn: function (msg) {
        this.add(msg, 'warning')
    },
    
    messages: messages,

    component: component
}
