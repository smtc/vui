var request = require('../request'),
    utils   = require('../utils'),
    message = require('../service/message')

module.exports = {
    template: require('./mult-select.html'),

    replace: true,

    paramAttributes: ['src', 'placeholder', 'single'],

    methods: {
        open: function () {
            if (this.$open) return
            this.$open = true
            setTimeout(function () {
                utils.addClass(this.$el, 'active')
                document.body.addEventListener('click', this.$closeHandle)
            }.bind(this), 50)
        },
        close: function () {
            if (!this.$open) return
            this.$open = false

            utils.removeClass(this.$el, 'active')
            document.body.removeEventListener('click', this.$closeHandle)
        },
        select: function (item, setOnly) {
            if (this.single) {
                this.values = [item]
                if (item.value !== this.value)
                    this.value = item.value
            } else {
                var index = this.values.indexOf(item)
                if (index === -1) {
                    this.values.push(item)
                } else if (!setOnly) {
                    this.values.splice(index, 1)
                }
                var v = []
                this.values.forEach(function (i) {
                    v.push(i.value)
                })

                var vs = v.join(',')
                if (vs !== this.value) {
                    this.value = vs
                }
            }
        },
        setValue: function (value) {
            if (undefined === value) {
                return
            }

            var values = value
            if ('string' === typeof value)
                values = this.single ? [value.toString()] : value.split(',')

            this.options.forEach(function (item) {
                if (values.indexOf(item.value.toString()) >= 0)
                    this.select(item, true)
            }.bind(this))
        }
    },

    computed: {
        text: function () {
            var t = []
            this.values.forEach(function (v) {
                t.push(v.text)
            })
            return t.join(',')
        }
    },

    data: function () {
        return {
            options: [],
            values: [],
            value: []
        }
    },

    ready: function () {
        var self = this
        utils.addClass(this.$el, 'select')

        this.$closeHandle = function (evt) {
            if (utils.isDescendant(self.$el, evt.target)) return
            self.close()
        }

        this.$watch('value', function (value) {
            this.setValue(value)
        }.bind(this))

        request.getData(this.src, function (res) {
            if (res.status === 200) {
                if (res.body instanceof Array) {
                    this.options = res.body
                } else if (res.body.status === 1) {
                    this.options = res.body.data
                } else {
                    message.error(res.body.msg || res.body.error)
                    return
                }
                this.setValue(this.value)
            } else {
                message.error(null, res.status)
            }
        }.bind(this))
    }
}
