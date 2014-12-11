var utils = require('../utils')

var vs  = {}

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
        if (typeof obj === 'object')
            val = utils.substitute(val, obj)
        return val
    },

    set: function (lang) {
        //vs = require('./' + lang)
        vs = lang
    }
}
