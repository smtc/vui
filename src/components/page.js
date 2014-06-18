var request   = require('../request'),
    utils     = require('../utils'),
    _location = require('../location'),
    forEach   = utils.forEach


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


module.exports = {
    paramAttributes: ['src', 'delay'],
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

            _location.search(search.obj)

            request.get(url)
                .end(function (res) {
                    self.data = res.body.data
                    self.total = res.body.total
                })
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
        var search = utils.parseKeyValue(utils.urlResolve(_location.url(), true).search) || {},
            self = this
        
        forEach(search, function (v, k) {
            switch (k) {
                case 'p.page':
                    self.pager.page = parseInt(v)
                    break
                case 'p.size':
                    self.pager.size = parseInt(v)
                    break
            }
        })

        if (!this.delay) this.update()
    },
    ready: function () {
        this.$watch('pager', this.update)
    }
}
