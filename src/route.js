var utils       = require('./utils'),
    _location    = require('./location'),
    urlResolve  = utils.urlResolve,
    lastPath    = urlResolve(_location.url()).pathname

function Route() {
    this.fns = {}
}

// basepath 为true时，只验证path部分
Route.prototype.bind = function (fn, basepath) {
    if (!fn || typeof fn !== "function") return this
    var hash = utils.hashCode(fn)

    if (this.fns.hasOwnProperty(hash)) return this
    
    var f = function () {
        if (basepath) {
            var url = urlResolve(_location.url(), true)
            if (url.pathname === lastPath) return this
            lastPath = url.pathname
        }
        fn()
    }
    window.addEventListener('hashchange', f)
    this.fns[hash] = f
    return this
}

// fn 为空时删除所有绑定事件
Route.prototype.unbind = function (fn) {
    var hash = utils.hashCode(fn),
        fns = this.fns

    utils.forEach(fns, function (f, h) {
        // 当fn为空或者与fns hash值相等时
        if (hash === 0 || hash === h) {
            window.removeEventListener('hashchange', f)
            delete fns[h]
        }
    })

    return this
}


module.exports = new Route()

