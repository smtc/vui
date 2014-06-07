var request = require('request')

module.exports = {
    className: 'select',
    template: require('./template.html'),
    data: {
        msg: 'abc'
    },
    paramAttributes: ['src'],
    created: function () {
        request.get(this.src).end(function (res) {
            console.log(res)
        })
    }
}
