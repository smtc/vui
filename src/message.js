/* 
 * message { text: '', type: '' }
 */
var messages = []

module.exports = {
    add: function (msg) {
        // 占位用，后面再完成
        alert(msg)

        /*
        var t = typeof msg
        if (t === 'string')
            messages.push({
                text: msg,
                type: 'warning'
            })
        else
            messages.push(msg)
        */
    },

    getMessages: function () {
        return messages
    }
}
