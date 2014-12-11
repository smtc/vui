var utils = require('../utils')

function formatTime(timestamp, ft) {
    if (!timestamp) return ""

    if (typeof timestamp === 'string')
        timestamp = parseInt(timestamp)

    var time = new Date(timestamp * 1000)
    return time.format(ft)
}

module.exports = {
    format: function (value, arr) {
        arr = arr || []
        return utils.format(value, arr)
    },

    date: function (timestamp, ft) {
        ft = ft || 'yyyy-MM-dd'
        return formatTime(timestamp, ft)
    },

    datetime: function (timestamp, ft) {
        ft = ft || 'yyyy-MM-dd hh:mm:ss'
        return formatTime(timestamp, ft)
    },

    substr: function (value, len) {
        if (!value) return ""
        if (value.length <= len) return value
        return value.substr(0, len) + '...'
    }
}
