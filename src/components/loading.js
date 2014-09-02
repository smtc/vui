var utils   = require('../utils'),
    handle  = { status: 0 }

var component = {
    template:   '<div v-transition v-show="handle.status > 0" class="loading">' +
                    '<div class="overlay"></div>' +
                    '<label><img v-show="img" v-attr="src:img" />{{text}}</label>' +
                '</div>',

    replace: true,

    data: {
        handle: handle,
        img: '',
        text: ''
    },

    created: function () {
        this.img = this.$el.getAttribute('img')
        this.text = this.$el.getAttribute('text')
        this.$el.removeAttribute('img')
        this.$el.removeAttribute('text')
    }

}

module.exports = {
    start: function () {
        handle.status++
    },

    end: function () {
        handle.status--
    },

    component: component
}
