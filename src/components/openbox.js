var Vue     = require('vue'),
    utils   = require('../utils'),
    lang    = require('../lang/lang'),
    //request = require('../request'),
    route   = require('../route')

/*
 * show: default -false 创建时是否显示
 * callback: [function, this] 关闭时回调方法
 */

function openbox(opts) {
    var callback = opts.callback,

        data = utils.extend({
            title: opts.title,
            width: opts.width || 6,
            model: {},
            btns: [],
            body: opts.body,
            src: opts.src
        }, opts.data),

        Openbox = Vue.extend({
            template: require('./openbox.html'),
            replace: true,
            methods: {
                show: function () {
                    //utils.addClass(this.$el, 'open')
                    this.$open = true
                },
                bgclose: function (e) {
                    var box = this.$el.querySelector('.openbox-content')
                    if (e.target === box || utils.isDescendant(box, e.target)) return
                    this.close()
                },
                close: function (suc) {
                    if (callback) {
                        callback(suc ? this.model : undefined)
                    }
                    this.$destroy()
                },
                getComponent: function () {
                }
            },
            data: data,
            created: function () {
                document.body.appendChild(this.$el)
                this.$open = false
                this.btns = []
                if (opts.btns) {
                    var self = this
                    utils.forEach(opts.btns, function (btn) {
                        if (typeof btn === 'string') {
                            switch(btn) {
                                case 'close':
                                    self.btns.push({ text: lang.get('button.close'), type:'default', fn: self.close.bind(self) })
                                    break
                                case 'ok':
                                    self.btns.push({ text: lang.get('button.ok'), type:'primary', fn: self.close.bind(self, true) })
                                    break
                            }
                        } else {
                            self.btns.push(btn)
                        }
                    })
                }

                this.$watch('src', function () {
                    if (this.src)
                        route.getComponent(this.src, function () {
                            this.content = this.src
                        }.bind(this))
                }.bind(this))
            },

            ready: function () {
            }
        }),

        vm = new Openbox()

    if (opts.show) vm.show()
   
    return vm
}

openbox.confirm = function (message, callback) {
    openbox({
        title: "Confirm",
        show: true,
        width: 6,
        body: message,
        btns: ['ok', 'close'],
        callback: callback
    })
}

module.exports = openbox
