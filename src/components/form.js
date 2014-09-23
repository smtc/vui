var utils       = require('../utils'),
    request     = require('../request'),
    _location    = require('../location'),
    lang        = require('../lang/lang'),
    loading     = require('./loading'),
    message     = require('./message')

function getStruct(struct) {
    struct = struct || []
    var hs = []
    utils.forEach(struct, function (v, i) {
        if (v.edit) hs.push(v)
    })
    return hs
}

// buttons =========================================================
var EDIT_OP = {
    "back": '<a class="btn btn-info" href="javascript:;" v-on="click:back"><i class="icon icon-reply"></i> {text}</a>'
}

function getEditOp(src) {
    var ops = [],
        op = '',
        obj
    src = src || {}
    utils.forEach(src, function (v, k) {
        op = EDIT_OP[k]
        if (!op) return
        obj = {
            // {{key}} replace {{d.key}}，模板需要用d.key取值
            op: v.replace(/\{\{([^{}]*)\}\}/g, "{{d.$1}}"),
            text: lang.get('button.' + k)
        }
        ops.push(utils.substitute(op, obj))
    })
    return ops.join('&nbsp; ')
}

// form controls ====================================================
function getControls(struct) {
    var controls = [],
        str

    function addIf(k, s) {
        if (s[k] === undefined) return ''
        return k + '="' + s[k] + '" '
    }

    function getCol(s) {
        var str = ''
        if (s.maxlen) {
            if (s.maxlen < 50) {
                str += 'col=",6" '
            } else {
                str += 'col=",12" '
            }
        } else {
            switch (s.type) {
                case 'integer':
                case 'select':
                    str += 'col=",4" '
                    break
            }
        }
        return str
    }

    function getType(s) {
        if (s.type === undefined || s.type === 'text' || s.type === 'textarea') {
            if (s.maxlen < 200)
                return 'type="text" '
            else
                return 'type="textarea" rows="6" '
        }

        if (s.type === 'bool')
            return 'type="checkbox" options="\'{text}\':true" '

        return 'type="' + s.type + '" '
    }

    struct.forEach(function (s) {
        str = '<form-control '

        if (s.type !== 'bool') str += 'label="{text}" '

        str += 'name="{key}" '

        if (s.equal) str += 'v-with="value:model.{key},equal:model.{equal}" '
        else str += 'v-with="value:model.{key}" '

        str += getCol(s)
        str += getType(s)
        utils.forEach(['min', 'max', 'minlen', 'maxlen', 'src', 'require', 'tip'], function (k) {
            str += addIf(k, s)
        })
        str += '></form-control>'
        controls.push(utils.substitute(str, s))
    })
    controls.push(utils.substitute('<form-control><button class="btn btn-primary" type="submit">{text}</button></form-control>', {text:lang.get('button.submit')}))
    return controls.join('')
}

var component = {
    //template: require('./form.html'),
    methods: {
        back: function () {
            window.history.back()
        },
        
        success: function (json) {
            this.back()
        }
    },

    data: {
        struct: null,
        content: ''
    },

    created: function () {
        this.valid = true
        this.controls = {}
        this.model = {}
        this.colon = _location.node(true).colon

        this.src = this.$el.getAttribute('action') || this.$el.getAttribute('src')

        var struct = this.$el.getAttribute("struct")
        if (struct) {
            struct = utils.format(struct, this.colon)
            loading.start()
            // use sync 
            request.get(struct).end(function (res) {
                loading.end()
                if (res.status !== 200 || res.body.status !== 1) {
                    message.error(res.body.errors, res.status)
                    return
                }

                this.struct = getStruct(res.body.struct)
                // if struct has src, use struct.src
                if (res.body.src)
                    this.src = res.body.src
                this.content = getControls(this.struct)
            }.bind(this), true)
        }

        if (this.src) {
            this.src = utils.format(this.src, this.colon)
        }
    },

    ready: function () {
        var node = _location.node(true),
            search = node.search,
            hash = node.hash
        request.get(this.src + hash).query(search).end(function (res) {
            if (res.status === 200) {
                if (res.body.status === 1 || res.body.data)
                    this.model = res.body.data || {}
                else if (res.body.errors)
                    message.error(res.body.errors)
            } else {
                //message.error('', res.status)
            }
        }.bind(this))


        var form = this.$el;
        if (form.tagName != "FORM")
            form = form.querySelector('form')

        form.addEventListener('submit', function (event) {
            event.preventDefault()
            this.$broadcast('check')
            this.valid = true

            utils.forEach(this.controls, function (v, k) {
                this.valid = this.valid && v
            }.bind(this))

            if (this.valid) {
                loading.start()
                request.post(this.src).send(this.model).end(function (res) {
                    loading.end()
                    if (res.status === 200) {
                        if (res.body.status === 1) {
                            this.success(res.body)
                        } else {
                            message.error(res.body.errors)
                        }
                    } else {
                        message.error('', res.status)
                    }
                }.bind(this))
            }
        }.bind(this))
    }
}

var component_struct = utils.copy(component)
component_struct.template = '<form v-show="struct" class="form-horizontal" v-html="content" role="form"></form>'

module.exports = {
    'form': component,
    'form-struct': component_struct
}
