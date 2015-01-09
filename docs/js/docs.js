(function () {
    var main = new Vue({
        el: 'body',
        data: {
            view: ''
        }
    })

    Vue.component('openbox-example', {
        template: '<div><content></content></div>',
        replace: true,
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

    vui.route(function (path) {
        main.view = path

        // 延时等component 执行完
        setTimeout(function () {
            prettyPrint()
        }, 500)
    }, true)

    if (!vui.utils.urlResolve().hash) 
        vui.utils.url('main.html')
})()
