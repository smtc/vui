(function () {
    var Vue = vui.require('vue'),

        Openbox = Vue.extend({
            methods: {
                open: function () {
                    vui.openbox({
                        show: true,
                        width: 900,
                        src: 'openbox_p1.html',
                        title: 'Openbox',
                        btns: ['ok', 'close'],
                        callback: function (modal) {
                            this.modal = modal
                        }.bind(this)
                    })
                }
            },
            data: {
                modal: {}
            }
        })


    new Vue({
        el: 'body',

        components: {
            'openboxExample': Openbox
        }
        
    })

})
