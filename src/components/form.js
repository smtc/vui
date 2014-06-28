
module.exports = {
    methods: {
    },

    created: function () {
        this.$el.addEventListener('submit', function (event) {
            event.preventDefault()
        })
    }
}
