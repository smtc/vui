var request = require('../request'),
    utils   = require('../utils')

function formatOption(opts) {
    if (!opts) return []
    if (utils.isArray(opts)) return opts

    if ('string' === typeof opts) {
        opts = opts.trim()
        if (opts.charAt(0) !== '{')
             opts = '{' + opts + '}'
        opts = eval('(' + opts + ')')
    }

    return opts
}

function contains(arr, val) {
    var suc = false
    utils.forEach(arr, function (s) {
        if (s == val)
            suc = true
    })
    return suc
}

module.exports = {
    template: require('./option.html'),
    paramAttributes: ['src', 'options', 'inline', 'name'],

    methods: {
        setValue: function (value, e) {
            if (this.type === 'radio')
                this.setRadioValue(e.target, value)
            else
                this.setCheckboxValue(e.target, value)
        },

        setCheckboxValue: function (el, value) {
            if (this.$single) {
                if (el.checked)
                    this.value = value
                else
                    this.value = null
            } else {
                if (el.checked)
                    this.value.push(value)
                else
                    utils.arrayRemove(this.value, value)
            }
        },

        setRadioValue: function (el, value) {
            this.value = value
        },

        check: function (value) {
            var vals = this.value
            if (!vals)
                vals = []
            else if ('string' === typeof vals)
                vals = [vals]

            return utils.contains(value)
        }
    },

    data: {
        options: null
    },

    created: function () {
        var src = this.src

        this.type = this.className = this.$el.getAttribute('type')
        this.name = this.name || utils.nextUid()

        if (utils.toBoolean(this.inline))
            this.className = this.type + '-inline'

        function judge() {
            this.$single = utils.size(this.options) === 1
        }

        if (this.options) {
            this.options = formatOption(this.options)
            judge.call(this)
        } else if (!this.options && src) {
            this.options = {}
            request.get(src).end(function (res) {
                this.options = formatOption(res.body)
                judge.call(this)
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

        this.$watch('value', function (value, mut) {
            if (this.type === 'radio')
                this.$el.querySelector('input[value="' + this.value + '"]').checked = true
            else {
                utils.forEach(this.$el.querySelectorAll('input[type="checkbox"]'), function (el) {
                    el.checked = value.toString() === el.value.toString() || contains(value, el.value)
                }.bind(this))
            }
        }.bind(this))
    }
}
