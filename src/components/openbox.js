var Vue     = require('vue'),
    utils   = require('../utils'),
    request = require('../request')

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
                },
                bgclose: function (e) {
                    var box = this.$el.querySelector('.openbox-content')
                    if (e.target == box || utils.isDescendant(box, e.target)) return
                    this.close()
                },
                close: function (suc) {
                    if (suc && callback) callback(this.modals)
                    console.log(this.modals)
                    this.$destroy()
                },
                getContent: function () {
                    if (this.src) {
                        request.get(this.src)
                            .end(function (res) {
                                this.content = res.text
                            }.bind(this))             
                    }
                }
            },
            data: {
                title: opts.title,
                width: opts.width || 600,
                modals: {}
            },
            created: function () {
                document.body.appendChild(this.$el)
                var self = this
                if (opts.btns) {
                    self.btns = []
                    utils.forEach(opts.btns, function (btn) {
                        if (typeof btn === 'string') {
                            switch(btn) {
                                case 'close':
                                    self.btns.push({ text: '关 闭', type:'default', fn: self.close.bind(self) })
                                    break
                                case 'ok':
                                    self.btns.push({ text: '确 定', type:'primary', fn: self.close.bind(self, true) })
                                    break
                            }
                        } else {
                            self.btns.push(btn)
                        }
                    })
                }

                this.$watch('src', function () {
                    self.getContent()
                })
                this.src = opts.src
            }
        })   

    if (opts.show) vm.show()
    return vm
}


module.exports = openbox
