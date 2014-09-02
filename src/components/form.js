var utils       = require('../utils'),
    request     = require('../request'),
    location    = require('../location'),
    loading     = require('./loading'),
    message     = require('./message')

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

        this.src = this.$el.getAttribute('action') || this.$el.getAttribute('src')

        var form = this.$el;
        if (form.tagName != "FORM")
            form = form.querySelector('form')

        // submit 使用 put 方法
        form.addEventListener('submit', function (event) {
            event.preventDefault()
            this.$broadcast('check')

            utils.forEach(this.controls, function (v, k) {
                this.valid = this.valid && v
            }.bind(this))

            if (this.valid) {
                loading.start()
                request.post(this.src).send(this.model).end(function (res) {
                    loading.end()
                    if (res.status === 200) {
                        if (res.body.status === 1) {
                            this.success(res.body)
                        } else {
                            message.error(res.body.error)
                        }
                    } else {
                        message.error('', res.status)
                    }
                }.bind(this))
            }
        }.bind(this))

    },

    ready: function () {
        var node = location.node(true),
            search = node.search,
            hash = node.hash
        request.get(this.src + hash).query(search).end(function (res) {
            if (res.status === 200) {
                if (res.body.status === 1)
                    this.model = res.body.data
                else if (res.body.errors)
                    message.error(res.body.errors)
            } else {
                //message.error('', res.status)
            }
        }.bind(this))
    }
}
