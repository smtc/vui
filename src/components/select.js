var request = require('../request'),
    utils   = require('../utils'),
    lang    = require('../lang/lang'),
    forEach = utils.forEach

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
        } else {
            request.get(this.src).end(function (res) {
                self.options = res.body
                self.setValue(self.value)
            })
        }

        this.$closeHandle = function () {
            self.close()
        }
    },
    ready: function () {
        var self = this
        self.$watch('value', function () {
            self.setValue(self.value)
        })
    }
}
