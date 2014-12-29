var request = require('../request'),
    utils   = require('../utils')

function formatOption(opts) {
    if (!opts) return []
    if (utils.isArray(opts)) {
        var newOpts = []
        utils.forEach(opts, function (o) {
            o.value = o.value.toString()
            newOpts.push(o)
        })
        return newOpts
    }

    if ('string' === typeof opts) {
        opts = opts.trim()
        if (opts.charAt(0) === '[')
            return eval('(' + opts + ')')

        if (opts.charAt(0) !== '{')
             opts = '{' + opts + '}'

        var arr = []
        utils.forEach(eval('(' + opts + ')'), function (v, k) {
            arr.push({ text:k, value:v.toString() })
        })
        opts = arr
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
                    this.values.push(value)
                else
                    utils.arrayRemove(this.values, value)

                if (this.flatValue)
                    this.value = this.values.join(',')
                else
                    this.value = this.values
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
        options: null,
        flatValue: false
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
                if (res.body instanceof Array) {
                    this.options = formatOption(res.body)
                } else if (res.body.status === 1) {
                    this.options = formatOption(res.body.data)
                }
                judge.call(this)
            }.bind(this), true)
        }

        // clear
        utils.forEach(['type', 'src', 'name', 'options'], function (attr) {
            this.$el.removeAttribute(attr)
        }.bind(this))

    },

    ready: function () {
        if (this.type === 'checkbox') {
            if (null === this.value || undefined === this.value)
                this.values = []
            else if ('string' === typeof this.value)
                this.values = this.value.split(',')
        }

        function change(value) {
            if (this.type === 'radio') {
                this.$el.querySelector('input[value="' + this.value + '"]').checked = true
            } else {
                if (typeof value === 'string') {
                    if (value === '') this.values = []
                    else this.values = value.split(',')
                    this.flatValue = true
                }
                utils.forEach(this.$el.querySelectorAll('input[type="checkbox"]'), function (el) {
                    if (value === null) {
                        el.checked = false
                        return
                    }
                    el.checked = contains(this.values, el.value)
                }.bind(this))
            }
        }

        change.call(this, this.value)

        this.$watch('value', function (value) {
            if (value === undefined) return
            change.call(this, value)
        }.bind(this))
    }
}
