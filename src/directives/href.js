var utils = require('../utils')

module.exports = {
    isLiteral: true,

    bind: function () {
        var self = this
        self.el.setAttribute('href', self.expression)
        self.el.addEventListener('click', function (event) {
            event.preventDefault()
            utils.url(self.expression)
        })
    }

}
