var utils = require('../utils')

function formatTime(timestamp, ft) {
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

    date: function (timestamp) {
        return formatTime(timestamp, 'yyyy-MM-dd')
    },

    datetime: function (timestamp) {
        return formatTime(timestamp, 'yyyy-MM-dd hh:mm:ss')
    }
}
