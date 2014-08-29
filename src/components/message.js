/* 
 * message { text: '', type: '' }
 */
var utils       = require('../utils'),
    messages    = [],
    httpStatus  = {
        404: '请求的地址不存在',
        500: '内部服务器错误'
    }

var component = {
    template:   '<div v-repeat="messages" class="alert alert-{{type}}">' +
                    '<strong>{{time}}</strong><br />' +
                    '{{text}}' +
                    '<button v-on="click: remove(this)" class="close">&times;</button>' +
                '</div>',

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
            msg = httpStatus[status]
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
