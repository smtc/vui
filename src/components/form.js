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
        // init 获取数据, post 方法
        var search = location.node(true).search
        if (search) {
            request.get(this.src).send(search).end(function (res) {
                if (res.body.status === 1)
                    this.model = res.body.data
                else
                    alert(res.body.errors)
            }.bind(this))
        }

    }
}
