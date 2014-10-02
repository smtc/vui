var request = require('../request'),
    utils   = require('../utils'),
    lang    = require('../lang/lang'),
    forEach = utils.forEach

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
        select: function (item) {
            if (this.single) {
                this.text = item.text
                if (item.value != this.value)
                    this.value = item.value
            } else {
                var index = this.values.indexOf(item)
                if (index === -1) {
                    this.values.push(item)
                } else {
                    this.values.splice(index, 1)
                }
                var v = [], t = []
                this.values.forEach(function (i) {
                    v.push(i.value)
                    t.push(i.text)
                })
                this.value = v.join(',')
                this.text = t.join(',')
            }
        },
        setValue: function (value) {
            if (undefined === value) {
                this.text = null
            }

            forEach(this.options, function (item) {
                if (value === item.value)
                    this.select(item)
            }.bind(this))
        }
    },
    data: {
        options: [],
        values: []
    },
    created: function () {
        var self = this
        this.values = []
        utils.addClass(this.$el, 'select')

        if (this.src === 'bool') {
            this.options = lang.get('boolSelect')
        } else if (this.src) {
            request.get(this.src).end(function (res) {
                if (res.body instanceof Array) {
                    self.options = res.body
                } else if (res.body.status === 1) {
                    self.options = res.body.data
                }
                self.setValue(self.value)
            })
        }

        this.$closeHandle = function (evt) {
            if (utils.isDescendant(self.$el, evt.target)) return
            self.close()
        }
    },
    ready: function () {
        var self = this
        self.$watch('value', function () {
            //self.setValue(self.value)
        })
    }
}
