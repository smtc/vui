var vs  = {}

module.exports = {
    get: function (key) {
        var ks  = key.split('.'),
            val = vs
        ks.forEach(function (k, i) {
            if (!val) {
                val = undefined
                return
            }
            val = val[k]
        })
        return val
    },

    set: function (lang) {
        vs = require('./' + lang)
    }
}
