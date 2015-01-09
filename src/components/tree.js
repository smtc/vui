var request = require('../request'),
    message = require('../service/message'),
    lib     = require('../lib'),
    _       = lib.underscore,
    Vue     = lib.Vue

function hasChildren(node) {
    return node.children && node.children.length > 0
}

function initData(data, list, p) {
    list = list || {}
    _.each(data, function (d) {
        d.id = d.id || _.uniqueId()
        d.$parent = p
        if (d.children && d.children.length > 0) {
            d.$type = 'folder'
            d.children = initData(d.children, list, d.id)
        } else {
            d.$type = 'file'
        }
        list[d.id] = d
        d.vui_status = 0
    })
    return data
}

function initValue(list, values, k) {
    values = values || []
    if (typeof values === 'string')
        values = values.split(',')

    _.each(list, function (d) {
        if (!hasChildren(d) && values.indexOf(d[k]) >= 0) {
            d.vui_status = 2
            setParent(d.$parent, list)
        }
    })
}

function setStatus(node, status) {
    node.vui_status = status
    _.each(node.children, function (d) {
        setStatus(d, status)
    })
}

function setParent(p, list) {
    if (p === undefined) return
    var node = list[p]
    var status = 0
    _.each(node.children, function (d) {
        status += d.vui_status
    })
    if (status === 0) {
        node.vui_status = 0
    } else if (status === (node.children.length * 2)) {
        node.vui_status = 2
    } else {
        node.vui_status = 1
    }
    setParent(node.$parent, list)
}

Vue.component('tree-folder', {
    template:   '<label v-class="active:current==node">\
                    <i class="icon" v-class="icon-minus-square-o:open, icon-plus-square-o:!open" v-on="click:open=!open"></i>\
                    <i v-show="selectable" class="icon" v-on="click:select(node)" v-class="icon-square-o:node.vui_status==0,icon-check-square:node.vui_status==2,icon-check-square-o:node.vui_status==1"></i>\
                    <i class="icon icon-folder-o" v-class="icon-folder-open-o: open"></i>\
                    <span v-on="click:current=node">{{node.text}}</span>\
                </label>\
                <ul class="list-unstyled" v-show="open">\
                    <li v-repeat="node:node.children" v-component="tree-{{node.$type}}"></li>\
                </ul>',

    inherit: true,

    data: function () {
        return {
            open: false
        }
    },

    methods: {
        select: function (node) {
            var status = node.vui_status < 2 ? 2 : 0
            setStatus(node, status)
            setParent(node.$parent, this.list)
        }
    }
})

Vue.component('tree-file', {
    template:   '<label v-class="active:current==node">\
                    <i class="icon icon-file-o"></i>\
                    <i v-show="selectable" v-on="click:select(node)" class="icon icon-square-o" v-class="icon-check-square: node.vui_status==2"></i>\
                    <span v-on="click:current=node">{{node.text}}</span>\
                </label>',

    inherit: true,

    data: function () {
        return {}
    },

    methods: {
        select: function (node) {
            var status = node.vui_status < 2 ? 2 : 0
            setStatus(node, status)
            setParent(node.$parent, this.list)
        }
    }
})

module.exports = {
    template: '<ul class="treeview list-unstyled"><li v-repeat="node:data" v-component="tree-{{node.$type}}"></li></ul>',

    replace: true,

    paramAttributes: ['src', 'key', 'selectable'],
    
    data: function () {
        return {
            data: [],
            selectable: false,
            list: {},
            current: null
        }
    },

    computed: {
        value: function () {
            return this.getSelected(this.key)
            var k = this.key,
                str = []

            var add = function (list) {
                if (!list) return
                _.each(list, function (node) {
                    if (node.vui_status > 0)
                        str.push(node[k])
                    add(node.children)
                })
            }

            add(this.list)
            
            return str.join(',')
        }
    },

    methods: {
        getSelected: function (k, full) {
            var status = full ? 1 : 0,
                str = []

            var add = function (list) {
                if (!list) return
                _.each(list, function (node) {
                    if (node.vui_status > status)
                        str.push(node[k])
                    add(node.children)
                })
            }

            add(this.data)
            
            return str.join(',')
        }
    },

    ready: function () {
        var self = this
        this.$initialized = false
        this.$first = true
        this.selectable = this.selectable === 'true'
        this.key = this.key || 'id'

        if (!this.src) {
            message.error(null, 404)
            return
        }

        request.get(this.src).end(function (res) {
           if (res.status !== 200) {
                message.error(null, res.status)
                return
            }
            if (_.isArray(res.body)) {
                res.body = {
                    status: 1,
                    data: res.body
                }
            } 
            
            if (res.body.status === 1) {
                self.data = initData(res.body.data, self.list)
                if (self.value && !self.$initialized) {
                    self.$initialized = true
                    initValue(self.list, self.value, self.key)
                }

            } else {
                message.error(res.body.msg || res.body.errors)
                return
            } 

            self.$watch('data', function () {
                console.log(self.data)
                //self.value = self.getSelected(self.key)
            })
        }, true)

        // 初始化赋值
        this.$watch('value', function () {
            if (this.$initialized) return
            this.$initialized = true
            initValue(this.list, this.value, this.select)
        }.bind(this))
    }
}

