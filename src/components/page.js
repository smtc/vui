var request   = require('../request'),
    utils     = require('../utils'),
    _location = require('../location'),
    route     = require('../route'),
    forEach   = utils.forEach,
    basepath  = _location.node(true).pathname


function getSearch(pager, filters, sort) {
    var search = {},
        txt = ""

    forEach({p:pager, f:filters, s:sort}, function (obj, pre) {
        if (!obj) return
        forEach(obj, function (v, k) {
            if (undefined !== v && '' !== v) search[pre + '.' + k] = v
        })
    })

    txt = utils.toKeyValue(search)
    return {
        obj: search,
        txt: txt ? "?" + txt : ""
    }
}

function routeChange() {
    // 如果路径不等于基础路径，忽略route
    if (_location.node(true).pathname === basepath)
        this.init()
}


module.exports = {
    paramAttributes: ['src', 'delay', 'routeChange'],
    methods: {
        search: function (fs) {
            if (fs === null) this.filters = {}
            this.pager.page = 1
            this.update()
        },
        update: function () {
            var self = this,
                search = getSearch(this.pager, this.filters, this.sort),
                url = this.currentUrl = this.src + search.txt

            if (this.routeChange)
                _location.search(search.obj)

            request.get(url)
                .end(function (res) {
                    self.data = res.body.data
                    self.total = res.body.total
                })
        },
        init: function () {
            var search = utils.parseKeyValue(_location.node(true).search) || {},
                self = this,
                size = this.$el.getAttribute("size")

            try {
                if (size) 
                    this.pager.size = parseInt(size)
            } catch (e) {}

            function setFilter(v, k) {
                if (k.indexOf('f.') !== 0) return
                self.filters[k.slice(2)] = v
            }
            
            forEach(search, function (v, k) {
                switch (k) {
                    case 'p.page':
                        self.pager.page = parseInt(v)
                        break
                    case 'p.size':
                        self.pager.size = parseInt(v)
                        break
                    default:
                        setFilter(v, k)
                        break
                }
            })
        },
        destroy: function () {
            this.$destroy()
        }
    },
    data: {
        data: [],
        filters: {},
        pager: {
            page: 1,
            size: 20
        },
        total: 0,
        sort: {}
    },
    created: function () {
        basepath = _location.node(true).pathname
        this.init()
        if (!this.delay) this.update()
    },
    ready: function () {
        this.$watch('pager', this.update)
        if (this.routeChange)
            route.bind([routeChange, this])
    },
    beforeDestroy: function () {
        console.log('destroy')
        if (this.routeChange)
            route.unbind([routeChange, this])
    }
}
