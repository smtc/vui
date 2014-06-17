var Vue         = require('vue'),
    utils       = require('./utils'),
    _location   = require('./location'),
    urlResolve  = utils.urlResolve,
    request     = require('./request'),
    lastPath    = urlResolve(_location.url()).pathname,
    fns         = {},
    components  = {}

function route(fn) {
    route.bind(function () {
        getComponent(fn)
    }, true)
}

// basepath 为true时，只验证path部分
route.bind = function (fn, basepath) {
    if (!fn || typeof fn !== "function") return this
    var hash = utils.hashCode(fn)

    if (fns.hasOwnProperty(hash)) return this
    
    var self = this,
        f = function () {
            if (basepath) {
                var url = urlResolve(_location.url(), true)
                if (url.pathname === lastPath) return this
                lastPath = url.pathname
            }
            fn()
        }
    window.addEventListener('hashchange', f)
    fns[hash] = f
}

// fn 为空时删除所有绑定事件
route.unbind = function (fn) {
    var hash = utils.hashCode(fn)

    utils.forEach(fns, function (f, h) {
        // 当fn为空或者与fns hash值相等时
        if (hash === 0 || hash === h) {
            window.removeEventListener('hashchange', f)
            delete fns[h]
        }
    })
}

function getComponent(fn) {
    var path = utils.urlResolve(_location.url(), true).pathname
    if (!components[path]) {
        components[path] = true
        request.get(path)
            .end(function (res) {
                Vue.component(path, {
                    template: res.text
                })
                fn(path)
            })
    } else {
        fn(path)
    }
}

module.exports = route

