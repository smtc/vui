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
    template: '<div v-repeat="o:options" class="{{className}}"><label><input type="{{type}}" v-attr="checked:o.checked || o.value == value" v-on="change:setValue(o.value, $event)" name="{{name}}" value="{{o.value}}" /> {{o.text}}</label></div>',

    paramAttributes: ['src', 'options', 'inline', 'name', 'array'],

    data: function () {
        return {
            options: null,
            className: '',
            values: [],
            value: ''
        }
    },

    ready: function () {
        var src = this.src

        this.className = this.type
        this.array = this.array === 'true'
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

        change: function (value) {
            if (undefined === value) {
                this.value = this.options[0].value
            }
            this.$el.querySelector('input[value="' + this.value + '"]').checked = true
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
                    this.values.push(value)
                else
                    this.values = _.without(this.values, value)

                this.value = this.array ? this.values : this.values.join(',')
            }
        },

        change: function (value) {
            if (typeof value === 'string') {
                if (value === '') this.values = []
                else this.values = value.split(',')
            } else {
                this.values = value
            }
            _.forEach(this.$el.querySelectorAll('input[type="checkbox"]'), function (el) {
                if (_.size(value) === 0) {
                    el.checked = false
                    return
                }
                el.checked = value.toString() === el.value.toString() || contains(this.values, el.value)
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
