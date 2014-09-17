var request   = require('../request'),
    utils     = require('../utils'),
    _location = require('../location'),
    route     = require('../route'),
    message   = require('./message'),
    loading   = require('./loading'),
    lang      = require('../lang/lang'),
    openbox   = require('./openbox'),
    forEach   = utils.forEach,
    basepath  = _location.node(true).pathname

function getSearch(pager, filters, sort) {
    var search = {},
        txt = ""

    forEach({p:pager, f:filters, s:sort}, function (obj, pre) {
        if (!obj) return
        pre = pre === 'f' ? 'f.': ''
        forEach(obj, function (v, k) {
            if (undefined !== v && '' !== v) search[pre + k] = v
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
    text: '<input class="form-control" placeholder="{text}" v-model="filters.{key}${filter}" />',
    select: '<div class="form-control" src="{src}" style="width:160px" placeholder="{text}" v-component="select" v-with="value:filters.{key}${filter}"></div>',
    bool: '<div class="form-control" src="bool" style="width:60px" placeholder="{text}" v-component="select" v-with="value:filters.{key}${filter}"></div>',
    date: '<div class="form-control date" style="width:140px" placeholder="{text}" v-component="date" v-with="date:filters.{key}${filter}"></div>'
}
function getFilter(struct) {
    struct = struct || []
    var filter = []
    utils.forEach(struct, function (v, i) {
        if (!v.filter) return
        var el = utils.substitute(FILTERS[v.type], v)
        filter.push(el)
    })
    return filter
}

function getStruct(struct) {
    struct = struct || []
    var hs = []
    utils.forEach(struct, function (v, i) {
        if (!v.hide) hs.push(v)
    })
    return hs
}

// buttons =========================================================
var UNIT_OP = {
    "edit": '<a title="{text}" v-href="{op}"><i class="icon icon-edit"></i></a>',
    "del": '<a title="{text}" class="text-danger" href="javascript:;" v-on="click:del(\'{op}\')"><i class="icon icon-trash-o"></i></a>'
}
var MULT_OP = {
    "new": '<a class="btn btn-success" v-href="{op}"><i class="icon icon-plus"></i> {text}</a>',
    "refresh": '<a class="btn btn-info" v-on="click:update"><i class="icon icon-refresh"></i> {text}</a>',
    "del": '<a class="btn btn-danger" title="{text}" class="text-danger" href="javascript:;" v-on="click:delSelect(\'{op}\')"><i class="icon icon-trash-o"></i> {text}</a>',
    "filter": '<a class="btn btn-default" v-if="filterTpl.length>0" href="javascript:;" v-on="click:filterShow=!filterShow"><i v-class="icon-eye:filterShow,icon-eye-slash:!filterShow" class="icon"></i> {text}</a>'
}
function getOp(src, oplist) {
    var ops = [],
        op = '',
        obj
    src = src || {}
    utils.forEach(src, function (v, k) {
        op = oplist[k]
        if (!op) return
        obj = {
            // {{key}} replace {{d.key}}，模板需要用d.key取值
            op: v.replace(/\{\{([^{}]*)\}\}/g, "{{d.$1}}"),
            text: lang.get('button.' + k)
        }
        ops.push(utils.substitute(op, obj))
    })
    return ops.join('&nbsp; ')
}
function getUnitOp(src) {
    return getOp(src, UNIT_OP)
}
function getMultOp(src, filter) {
    var ops = getOp(src, MULT_OP)
    if (filter)
        ops += '&nbsp; ' + utils.substitute(MULT_OP["filter"], { text: lang.get('button.filter') })
    return ops
}

var component = {

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
            request.get(url).end(function (res) {
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
            var self = this
            function _del() {
                loading.start()
                request.del(self.src).send(data).end(function (res) {
                    loading.end()
                    if (res.status != 200) {
                        message.error('', res.status)
                        return
                    }
                    if (res.body.status === 1)
                        self.update()
                    else
                        message.error(res.body.errors)
                })
            }
            
            var count = 1
            if ('string' !== typeof data)
                count = data.length
            openbox.confirm(lang.get('page.del_confirm', {count: count}), function (status) {
                if (status) _del()
            })
            
        },

        delSelect: function (keys) {
            keys = keys || 'id'
            if (typeof keys == 'string')
                keys = keys.split(',')

            for (var i=0; i<keys.length; i++) {
                keys[i] = keys[i].trim()
            }
            var data = this.getSelected.apply(this, keys)

            if (data.length === 0)
                message.warn(lang.get('page.must_select'))
            else
                this.del(data)
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
            this.pageable = !(this.$el.getAttribute('pageable') === 'false')
            if (!this.pageable) this.pager = {}

            function setFilter(v, k) {
                if (k.indexOf('f.') !== 0) return
                self.filters[k.slice(2)] = v
            }
            
            forEach(search, function (v, k) {
                switch (k) {
                    case 'page':
                        self.pager.page = parseInt(v)
                        break
                    case 'size':
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
        struct: null,
        pageable: false
    },
    created: function () {
        this.init()

        var struct = this.$el.getAttribute("struct")
        if (struct) {
            loading.start()
            // use sync 
            request.get(struct).end(function (res) {
                loading.end()
                if (res.status !== 200 || res.body.status !== 1) {
                    message.error(res.body.errors, res.status)
                    return
                }

                this.struct = getStruct(res.body.struct)
                this.filterTpl = getFilter(res.body.struct)
                // if struct has src, use struct.src
                if (res.body.src)
                    this.src = res.body.src
                if (res.body.pageable !== undefined)
                    this.pageable = res.body.pageable
                if (res.body.op) {
                    this.unitOp = getUnitOp(res.body.op.unit)
                    this.multOp = getMultOp(res.body.op.mult, this.filterTpl.length>0)
                }
            }.bind(this), true)
        }

        if (this.src) {
            this.colon = _location.node(true).colon
            this.src = utils.format(this.src, this.colon)
        }
    },
    ready: function () {
        if (this.routeChange)
            route.bind(routeChange.bind(this))

        if (!this.delay) this.update()

        var form = this.$el.querySelector('form')
        if (form) {
            form.addEventListener('submit', function (event) {
                event.preventDefault()
            })
        }
    },
    beforeDestroy: function () {
        if (this.routeChange)
            route.unbind(routeChange.bind(this))
    }
}

var component_struct = utils.copy(component)
component_struct.template = require('./page.html')

module.exports = {
    'page': component,
    'page-struct': component_struct
}
