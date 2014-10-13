var request = require('../request'),
    utils   = require('../utils'),
    lang    = require('../lang/lang'),
    forEach = utils.forEach,
    caches  = {}

module.exports = {
    template: require('./select.html'),
    replace: true,
    paramAttributes: ['src', 'placeholder'],
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
            //this.placeholder = ''
            this.text = item.text
            if (item.value != this.value)
                this.value = item.value
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
        options: []
    },
    created: function () {
        var self = this
        utils.addClass(this.$el, 'select')

        if (this.src === 'bool') {
            this.options = lang.get('boolSelect')
        } else if (this.src) {
            if (caches[this.src]) {
                this.options = caches[this.src]
                this.setValue(this.value)
            } else {
                request.get(this.src).end(function (res) {
                    if (res.body instanceof Array) {
                        self.options = res.body
                    } else if (res.body.status === 1) {
                        self.options = res.body.data
                    }
                    self.setValue(self.value)
                    caches[self.src] = self.options
                })
            }
        }

        this.$closeHandle = function () {
            self.close()
        }

        self.$watch('value', function () {
            self.setValue(self.value)
        })
    }
}
