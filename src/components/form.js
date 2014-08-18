var utils = require('../utils'),
    request = require('../request'),
    location = require('../location'),
    message = require('./message')

module.exports = {
    methods: {
        back: function () {
            window.history.back()
        },
        
        success: function (json) {
            this.back()
        }
    },

    created: function () {
        this.valid = true
        this.controls = {}
        this.model = {}

        this.src = this.$el.getAttribute('action')

        // submit 使用 put 方法
        this.$el.addEventListener('submit', function (event) {
            event.preventDefault()
            this.$broadcast('check')

            utils.forEach(this.controls, function (v, k) {
                this.valid = this.valid && v
            }.bind(this))

            if (this.valid)
                request.post(this.src).send(this.model).end(function (res) {
                    if (res.body.status === 1) {
                        this.success(res.body)
                    } else {
                        message.error(res.body.error)
                    }
                }.bind(this))
        }.bind(this))

    },

    ready: function () {
        var node = location.node(true),
            search = node.search,
            hash = node.hash
        request.get(this.src + hash).query(search).end(function (res) {
            if (res.status != 200) {
                if (res.body.status === 1)
                    this.model = res.body.data
                else if (res.body.errors)
                    message.error(res.body.errors)
            }
        }.bind(this))
    }
}
