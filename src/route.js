var utils       = require('./utils'),
    location    = require('./location'),
    urlResolve  = utils.urlResolve,
    lastPath    = urlResolve(location.url()).pathname

function Route() {
    this.fns = {}
}

// basepath 为true时，只验证path部分
Route.prototype.bind = function (fn, basepath) {
    if (!fn || typeof fn != "function") return this
    var hash = utils.hashCode(fn)

    if (this.fns.hasOwnProperty(hash)) return this
    
    var f = function (event) {
        if (basepath) {
            /////////////            
        }
        fn()
    }
    window.addEventListener('hashchange', f)
    this.fns[hash] = f
    return this
}

Route.prototype.unbind = function (fn) {
    var hash = utils.hashCode(fn),
        fns = this.fns

    utils.forEach(fns, function (f, h) {
        // 当fn为空或者与fns hash值相等时
        if (hash == 0 || hash == h) {
            window.removeEventListener('hashchange', f)
            delete fns[h]
        }
    })

    return this
}


module.exports = new Route()

