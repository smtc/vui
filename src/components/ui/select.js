var request = require('superagent'),
    utils   = require('../../utils')

module.exports = {
    template: require('./select.html'),
    replace: true,
    paramAttributes: ['src', 'placeholder', 'value', 'text'],
    methods: {
        toggle: function () {
            utils.toggleClass(this.$el, 'active')
        },
        select: function (item) {
            this.placeholder = ''
            this.text = item.text
            this.value = item.value
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
        })
    }
}
