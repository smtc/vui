var Vue   = require('vue'),
    utils = require('../utils')

/*
 * show: default -false 创建时是否显示
 * callback: [function, this] 关闭时回调方法
 */

function openbox(opts) {
    var callback = opts.callback,
        vm = new Vue({
            template: require('./openbox.html'),
            replace: true,
            methods: {
                show: function () {
                    utils.addClass(this.$el, 'open')
                    var box = this.$el.querySelector('.openbox-content')
                    box.style.width = this.width
                    //box.style.marginLeft = -(box.offsetWidth / 2) 
                    //box.style.marginTop = 0 - (box.offsetHeight / 2) - 40
                },
                close: function (suc, e) {
                    var box = this.$el.querySelector('.openbox-content')
                    console.log(e.target == box)
                    console.log(box.hasChildNodes(e.target))
                    if (e.target == box || box.hasChildNodes(e.target)) return
                    if (callback) callback(this.$data)
                    this.$destroy()
                }
            },
            data: {
                title: opts.title,
                width: opts.width || 600
            },
            created: function () {
                document.body.appendChild(this.$el)
            }
        })   

    if (opts.show) vm.show()
    return vm
}


module.exports = openbox
