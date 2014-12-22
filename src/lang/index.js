var _   = require('../lib').underscore,
    vs  = {}

module.exports = {
    get: function (key, obj) {
        var ks  = key.split('.'),
            val = vs
        ks.forEach(function (k) {
            if (!val) {
                val = undefined
                return
            }
            val = val[k]
        })
        if (typeof obj === 'object') {
            var temp = _.tempate(val)
            val = temp(obj)
        }
        return val
    },

    set: function (lang) {
        vs = lang
    }
}
