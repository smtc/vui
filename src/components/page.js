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

            if (this.routeChange && this.routeChange === 'true')
                _location.search(search.obj)

            request.get(url)
                .end(function (res) {
                    self.data = res.body.data
                    self.total = res.body.total
                })
        },

        del: function (data) {
            request.del(this.src).send(data).end(function (res) {
                if (res.body.status === 1)
                    this.update()
                else
                    alert(res.body.errors)
            }.bind(this))
        },

        selectAll: function () {
            var allChecked = this.allChecked = !this.allChecked
            utils.forEach(this.data, function (d) {
                d.vui_checked = allChecked
            })
        },

        select: function (item) {
            item.vui_checked = !item.vui_checked
        },

        init: function () {
            var search = utils.parseKeyValue(_location.node(true).search) || {},
                self = this

            this.allChecked = false
            this.pager = {
                page: 1,
                size: 20
            }

            this.filters = {}
            this.sort = {}

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

            try {
                var size = this.$el.getAttribute("size")
                if (size) this.pager.size = parseInt(size)
            } catch (e) {}
        },
        destroy: function () {
            this.$destroy()
        }
    },
    data: {
        data: [],
        filters: {},
        pager: {},
        total: 0,
        sort: {}
    },
    created: function () {
        this.init()
        if (!this.delay) this.update()
    },
    ready: function () {
        this.$watch('pager', this.update)
        if (this.routeChange)
            //route.bind([routeChange, this])
            route.bind(routeChange.bind(this))
    },
    beforeDestroy: function () {
        if (this.routeChange)
            //route.unbind([routeChange, this])
            route.unbind(routeChange.bind(this))
    }
}
