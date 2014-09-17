var utils = require('../utils')

module.exports = {
    format: function (value, arr) {
        arr = arr || []
        return utils.format(value, arr)
    }
}
