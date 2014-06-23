var request = require('../request'),
    utils   = require('../utils'),
    forEach = utils.forEach

module.exports = {
    template: require('./select.html'),
    replace: true,
    paramAttributes: ['src', 'placeholder'],
    methods: {
        toggle: function () {
            utils.toggleClass(this.$el, 'active')
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
                if (value == item.value)
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
        request.get(this.src).end(function (res) {
            self.options = res.body
            self.setValue(self.value)
        })
    },
    ready: function () {
        var self = this
        self.$watch('value', function () {
            self.setValue(self.value)
        })
    }
}
