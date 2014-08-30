var request   = require('../request'),
    utils     = require('../utils'),
    _location = require('../location'),
    route     = require('../route'),
    message   = require('./message'),
    loading   = require('./loading'),
    lang      = require('../lang/lang'),
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

// filters ========================================================
var FILTERS = {
    text: '<input class="form-control" placeholder="{text}" v-model="filters.{key}" />',
    select: '<div class="form-control" src="{src}" style="width:160px" placeholder="{text}" v-component="select" v-with="value:filters.{key}"></div>',
    bool: '<div class="form-control" src="bool" style="width:60px" placeholder="{text}" v-component="select" v-with="value:filters.{key}"></div>',
    date: '<div class="form-control date" style="width:140px" placeholder="{text}" v-component="date" v-with="date:filters.{key}"></div>'
}
function getFilter(headers) {
    headers = headers || []
    var filter = []
    utils.forEach(headers, function (v, i) {
        if (!v.filter) return
        var el = utils.substitute(FILTERS[v.type], v)
        filter.push(el)
    })
    return filter
}

module.exports = {
    template: require('./page.html'),

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

            loading.start()
            request.get(url)
                .end(function (res) {
                    loading.end()
                    if (res.status != 200) {
                        message.error('', res.status)
                        return
                    }
                    self.data = res.body.data
                    self.total = res.body.total
                })
        },

        updateModel: function (item) {
            loading.start()
            request.put(this.src).send(item.$data).end(function (res) {
                loading.end()
                if (res.status != 200) {
                    message.error('', res.status)
                    return
                }
                if (res.body.status === 1)
                    message.success(res.body.msg || 'success')
                else
                    message.error(res.body.errors)
            })
        },

        del: function (data) {
            loading.start()
            request.del(this.src).send(data).end(function (res) {
                loading.end()
                if (res.status != 200) {
                    message.error('', res.status)
                    return
                }
                if (res.body.status === 1)
                    this.update()
                else
                    message.error(res.body.errors)
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

        getSelected: function () {
            var sd = [],
                args = Array.prototype.slice.call(arguments),
                len = args.length,
                nd = null
            utils.forEach(this.data, function (d) {
                if (!d.vui_checked) return

                if (len === 0)
                    nd = d
                else if (len === 1)
                    nd = d[args[0]]
                else {
                    nd = {}
                    utils.forEach(args, function (v, i) {
                        nd[v] = d[v]
                    })
                }
                
                sd.push(nd)
            })
            return sd
        },


        init: function () {
            var search = utils.parseKeyValue(_location.node(true).search) || {},
                self = this

            this.allChecked = false
            this.pager = {
                page: 1,
                size: 20
            }

            this.button = lang.get('button')
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
        sort: {},
        struct: false,
        src: ''
    },
    created: function () {
        this.init()

        var struct = this.$el.getAttribute("struct")
        if (struct) {
            loading.start()
            request.get(struct).end(function (res) {
                loading.end()
                if (res.status !== 200 || res.body.status !== 1) {
                    message.error(res.body.errors, res.status)
                    return
                }

                this.struct = true
                this.headers = res.body.headers
                this.filterTpl = getFilter(this.headers)
                if (res.body.src)
                    this.src = res.body.src
            }.bind(this), true)
        }

        if (!this.delay) this.update()

        var form = this.$el.querySelector('form')
        if (form) {
            form.addEventListener('submit', function (event) {
                event.preventDefault()
            })
        }
    },
    ready: function () {
        if (this.routeChange)
            route.bind(routeChange.bind(this))
    },
    beforeDestroy: function () {
        if (this.routeChange)
            route.unbind(routeChange.bind(this))
    }
}
