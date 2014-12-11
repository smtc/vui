(function () {
    Vue.component('openbox-example', {
        methods: {
            open: function (url) {
                vui.openbox({
                    show: true,
                    width: 8,
                    src: url,
                    title: 'Openbox',
                    btns: ['ok', 'close'],
                    data: { 
                        model: vui.utils.copy(this.model)
                    },
                    callback: function (model) {
                        this.model = model
                    }.bind(this)
                })
            }
        },
        data: function () {
            return {
                model: {
                    name: 'openbox callback test'
                }
            }
        }
    })
})()
