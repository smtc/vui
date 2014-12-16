var lib         = require('./lib'),
    Vue         = lib.Vue,
    request     = require('./request'),
    utils       = require('./utils'),
    lastPath    = utils.urlResolve().pathname,
    fns         = {},
    components  = {}

function route(fn, init) {
    function getComponent(fn) {
        var path = utils.urlResolve(true).pathname
        route.getComponent(path, fn)
    }

    route.bind(function () {
        getComponent(fn)
    }, true)
    if (init) {
        getComponent(fn)
    }
}


// basepath 为true时，只验证path部分
route.bind = function (fn, basepath) {
    if (!fn) return this
    var hash = utils.hashCode(fn)

    if (fns.hasOwnProperty(hash)) return this
    
    var f = function () {
        if (basepath) {
            var url = utils.urlResolve(true)
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

route.getComponent = function (path, fn) {
    var hash = 'template' + utils.hashCode(path)
    if (!components[hash]) {
        components[hash] = true

        request.getTemplate(path)
            .end(function (template) {
                Vue.component(hash, {
                    template: template
                })
                fn(hash)
            })
    } else {
        fn(hash)
    }
}

module.exports = route

