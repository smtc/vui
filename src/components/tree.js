var request = require('../request'),
    message = require('./message'),
    utils   = require('../utils')

var index = 1
function getUid() {
    return index++
}

function hasChildren(node) {
    return node.children && node.children.length > 0
}

function initData(data, list, p) {
    list = list || {}
    utils.forEach(data, function (d, i) {
        d.id = d.id || getUid()
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

    utils.forEach(list, function (d) {
        if (!hasChildren(d) && values.indexOf(d[k]) >= 0) {
            d.vui_status = 2
            setParent(d.$parent, list)
        }
    })
}

function setStatus(node, status) {
    node.vui_status = status
    utils.forEach(node.children, function (d, i) {
        setStatus(d, status)
    })
}

function setParent(p, list) {
    if (p === undefined) return
    var node = list[p]
    var status = 0
    utils.forEach(node.children, function (d) {
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

var tree = {
    template: '<ul class="treeview list-unstyled"><li v-repeat="node:data" v-with="list:list, current:current" v-component="tree-{{node.$type}}"></li></ul>',

    replace: true,

    paramAttributes: ['src', 'selectable'],
    
    data: {
        data: [],
        selectable: false,
        current: null
    },

    methods: {
        getSelected: function (k, full) {
            var status = full ? 1 : 0
            var str = []
            utils.forEach(this.list, function (node) {
                if (node.vui_status > status)
                    str.push(node[k])
            })
            return str.join(',')
        }
    },

    created: function () {
        var self = this
        this.data = []
        this.list = {}
        this.selectable = this.selectable === 'true'
        this.value = ''
        var selectId = this.$el.getAttribute('select') || 'id'
        if (this.src) {
            request.get(this.src).end(function (res) {
                if (res.status !== 200) {
                    message.error(null, res.status)
                    return
                }
                if (res.body.status == 1) {
                    self.data = initData(res.body.data, self.list)
                    initValue(self.list, self.value, selectId)
                } else {
                    message.error(res.body.errors)
                }
            })
        }

        this.$watch('data', function () {
            this.value = this.getSelected(selectId)
        }.bind(this))
    }
}

var folder = {
    template:   '<label v-class="active:current==node">\
                    <i class="icon" v-class="icon-minus-square-o:open, icon-plus-square-o:!open" v-on="click:open=!open"></i>\
                    <i v-show="selectable" class="icon" v-on="click:select(node)" v-class="icon-square-o:node.vui_status==0,icon-check-square:node.vui_status==2,icon-check-square-o:node.vui_status==1"></i>\
                    <i class="icon icon-folder-o" v-class="icon-folder-open-o: open"></i>\
                    <span v-on="click:current=node">{{node.text}}</span>\
                </label>\
                <ul class="list-unstyled" v-show="open">\
                    <li v-repeat="node:node.children" v-with="list:list, current:current" v-component="tree-{{node.$type}}"></li>\
                </ul>',

    data: {
        open: false,
        list: {}
    },

    methods: {
        select: function (node) {
            var status = node.vui_status < 2 ? 2 : 0
            setStatus(node, status)
            setParent(node.$parent, this.list)
        }
    }
}

var file = {
    template:   '<label v-class="active:current==node">\
                    <i class="icon icon-file-o"></i>\
                    <i v-show="selectable" v-on="click:select(node)" class="icon icon-square-o" v-class="icon-check-square: node.vui_status==2"></i>\
                    <span v-on="click:current=node">{{node.text}}</span>\
                </label>',

    data: {},

    methods: {
        select: function (node) {
            var status = node.vui_status < 2 ? 2 : 0
            setStatus(node, status)
            setParent(node.$parent, this.list)
        }
    }
}

module.exports = {
    tree:   tree,
    folder: folder,
    file:   file
}
