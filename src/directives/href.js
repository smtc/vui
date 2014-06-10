var location = require('../location')

module.exports = {
    isLiteral: true,

    bind: function () {
        var self = this
        self.el.setAttribute('href', self.expression)
        self.el.addEventListener('click', function (event) {
            event.preventDefault()
            location.url(self.expression)
        })
    },

    unbind: function () {
    }

}
