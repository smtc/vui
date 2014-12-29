var request = require('../request'),
    utils   = require('../utils'),
    lang    = require('../lang'),
    message = require('../service/message'),
    _       = require('../lib').underscore

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
            this.text = item.text
            if (item.value !== this.value)
                this.value = item.value
        },

        setValue: function (value) {
            _.each(this.options, function (item) {
                if (value === item.value)
                    this.select(item)
            }.bind(this))
        }
    },

    data: function () {
        return {
            options: [],
            value: undefined,
            text: ''
        }
    },

    ready: function () {
        var self = this
        utils.addClass(this.$el, 'select')
        
        this.$closeHandle = function () {
            self.close()
        }

        this.$watch('value', function () {
            self.setValue(self.value)
        })

        if (!this.src) return

        if (this.src === 'bool') {
            this.options = lang.get('boolSelect')
            return
        } 
       
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
