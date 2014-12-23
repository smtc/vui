var handle  = { status: 0 }

var component = {
    paramAttributes: ['img', 'text'],

    template:   '<div v-transition v-show="handle.status > 0" class="loading">' +
                    '<div class="overlay"></div>' +
                    '<label><img v-show="img" v-attr="src:img" />{{text}}</label>' +
                '</div>',

    replace: true,

    data: function () {
        return {
            handle: handle
        }
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
