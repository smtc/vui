module.exports = {
    template: '<input type="file" /><img v-attr="src:src" />',

    paramAttributes: ['src'],

    data: {
        src: '',
        data: null,
        value: ''
    },

    ready: function () {
        var self = this
        this.$el.addEventListener('change', function (evt) {
            var f = evt.target.files[0]; 
            if (f) {
                self.value = f.name
                self.data = f
                var reader = new FileReader();  
                reader.onload =function(e){  
                    self.src = e.target.result
                }  
                reader.readAsDataURL(f);
            }
        })
    }
}
