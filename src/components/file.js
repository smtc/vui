module.exports = {
    template: '<input type="file" />',

    replace: true,

    data: {
        data: null,
        value: ''
    },

    ready: function () {
        var self = this
        this.$el.addEventListener('change', function (evt) {
            var f = evt.target.files[0]; 
            self.value = f.name
            self.data = f
        })
    }
}
