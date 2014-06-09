var location = require('../location')

module.exports = {
    bind: function () {
        this.el.setAttribute('href', this.el.getAttribute('v-href'))
        this.el.addEventListener('click', function (event) {
            event.preventDefault()
        })
    },

    update: function (value) {
        if (value)
            this.el.setAttribute('href', value)
    }
}
