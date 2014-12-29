var request = require('../request'),
    _       = require('../lib').underscore

function formatOption(opts) {
    if (!opts) return []
    if (_.isArray(opts)) {
        return _.map(opts, function (o) { return o })
    }

    if ('string' === typeof opts) {
        opts = opts.trim()
        if (opts.charAt(0) === '[')
            return eval('(' + opts + ')')

        if (opts.charAt(0) !== '{')
             opts = '{' + opts + '}'

        var arr = []
        _.forEach(eval('(' + opts + ')'), function (v, k) {
            arr.push({ text:k, value:v })
        })
        opts = arr
    }

    return opts
}

function contains(arr, val) {
    var suc = false
    if (undefined === val) return false

    _.forEach(arr, function (s) {
        if (undefined === s) return

        if (s.toString() === val.toString())
            suc = true
    })
    return suc
}

var common = {
    template: require('./option.html'),

    paramAttributes: ['src', 'options', 'inline', 'name'],

    data: function () {
        return {
            options: null,
            className: '',
            value: ''
        }
    },

    ready: function () {
        var src = this.src

        this.className = this.type
        this.name = this.name || _.uniqueId('opt_')

        if (this.inline)
            this.className = this.type + '-inline'

        if (this.options) {
            this.options = formatOption(this.options)
        } else if (!this.options && src) {
            this.options = []
            request.getData(src, function (res) {
                if (res.body instanceof Array) {
                    this.options = formatOption(res.body)
                } else if (res.body.status === 1) {
                    this.options = formatOption(res.body.data)
                }
            }.bind(this))
        }

        // clear
        _.forEach(['src', 'name', 'options'], function (attr) {
            this.$el.removeAttribute(attr)
        }.bind(this))

        if (this.type === 'checkbox') {
            if (null === this.value || undefined === this.value)
                this.value = []
            else if ('string' === typeof this.value)
                this.value = this.value.split(',')
        }

        this.change(this.value)

        this.$watch('value', function (value) {
            if (value === undefined) return
            this.change(value)
        }.bind(this))
    }

}

var radio = {
    methods: {
        setValue: function (value) {
            this.value = value
        },

        /*
        check: function (value) {
            var vals = this.value
            if (!vals)
                vals = []
            else if ('string' === typeof vals)
                vals = [vals]

            return vals.indexOf(value) >= 0
        },
        */

        change: function (value) {
            if (value)
                this.$el.querySelector('input[value="' + value + '"]').checked = true
        }
    },

    created: function () {
        this.type = 'radio'
    }
}

var checkbox = {
    methods: {
        setValue: function (value, e) {
            var checked = e.target.checked
            if (_.size(this.options) === 1) {
                if (checked)
                    this.value = value
                else
                    this.value = null
            } else {
                if (checked)
                    this.value.push(value)
                else
                    this.value = _.without(this.value, value)
            }
        },

        change: function (value) {
            if (typeof value === 'string') {
                if (value === '') this.value = []
                else this.value = this.value.split(',')
            }
            _.forEach(this.$el.querySelectorAll('input[type="checkbox"]'), function (el) {
                if (value === null) {
                    el.checked = false
                    return
                }
                el.checked = _.isEqual(value, el.value) || contains(value, el.value)
            }.bind(this))
        }
    },

    created: function () {
        this.type = 'checkbox'
    }
}

module.exports = {
    radio: _.extend(radio, common),

    checkbox: _.extend(checkbox, common)
}
