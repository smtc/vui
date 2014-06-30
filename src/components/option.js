var request = require('../request'),
    utils   = require('../utils')

module.exports = {
    template: require('./option.html'),

    methods: {
        setValue: function (value, e) {
            if (this.type === 'radio')
                this.setRadioValue(e.target, value)
            else
                this.setCheckboxValue(e.target, value)
        },

        setCheckboxValue: function (el, value) {
            if (el.checked)
                this.value.push(value)
            else
                utils.arrayRemove(this.value, value)
        },

        setRadioValue: function (el, value) {
            this.value = value
        }
    },

    data: {
        options: null, 
        value: null
    },

    created: function () {
        var src = this.$el.getAttribute('src'),
            opts = this.$el.getAttribute('options')

        this.type = this.className = this.$el.getAttribute('type')
        this.name = this.$el.getAttribute('name') || utils.nextUid()

        if (utils.toBoolean(this.$el.getAttribute('inline')))
            this.className = this.type + '-inline'

        if (!this.options && opts) {
            opts = opts.trim()
            if (opts.charAt(0) !== '{') opts = '{' + opts + '}'
            this.options = eval('(' + opts + ')')
        } else if (!this.options && src) {
            this.options = {}
            request.get(src).end(function (res) {
                this.options = res.body
            }.bind(this))
        }

        // clear
        utils.forEach(['type', 'src', 'name', 'options'], function (attr) {
            this.$el.removeAttribute(attr)
        }.bind(this))
    },

    ready: function () {
        if (this.type === 'checkbox') {
            if (null === this.value || undefined === this.value)
                this.value = []
            else if ('string' === typeof this.value)
                this.value = this.value.split(',')
        }
    }
}
