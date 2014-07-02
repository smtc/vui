var utils = require('../utils')

function getCol(str, label) {
    var col = [2, 10, 0]

    if (str) {
        try {
            var ss = str.split(',')
            utils.forEach(ss, function (s, i) {
                ss[i] = parseInt(s)
            })

            if (ss.length === 1)
                col = [ ss[0], 12-ss[0], 0]
            else if (ss.length === 2)
                col = [ ss[0], ss[1], 0 ]
            else
                col = ss

        } catch (e) {}
    }

    if (!label && col[2] === 0)
        col[2] = col[0]

    return col
}

var TEMPLATES = {
        'submit': '<button class="btn" type="submit">{{_text}}</button>',
        'button': '<button class="btn" type="button">{{_text}}</button>',
        'radio': '<div type="radio" v-component="option" name="{{_name}}" v-with="value:value" inline="{{_inline}}" src="{{_src}}" options="{{_options}}"></div>',
        'checkbox': '<div type="checkbox" v-component="option" name="{{_name}}" v-with="value:value" inline="{{_inline}}" src="{{_src}}" options="{{_options}}"></div>',
        'textarea': '<textarea class="form-control" v-attr="readonly:_readonly" name="{{_name}}" v-model="value" rows="{{_rows}}"></textarea>',
        'select': '<div class="form-control select" src="{{_src}}" v-with="value:value" v-component="select"></div>',
        'date': '<div class="form-control date" v-component="date" v-with="date:value" id="{{id}}" name="{{_name}}"></div>',
        'integer': '<input class="form-control" v-attr="readonly:_readonly" id="{{id}}" v-model="value" name="{{_name}}" type="text" />',
        'alpha': '<input class="form-control" v-attr="readonly:_readonly" id="{{id}}" v-model="value" name="{{_name}}" type="text" />',
        'alphanum': '<input class="form-control" v-attr="readonly:_readonly" id="{{id}}" v-model="value" name="{{_name}}" type="text" />',
        'default': '<input class="form-control" v-attr="readonly:_readonly" id="{{id}}" v-model="value" name="{{_name}}" type="{{_type}}" />',
        'empty': ''
    },

    REGS = {
        'email': /^[a-z0-9!#$%&'*+/=?^_`{|}~.-]+@[a-z0-9-]+(\.[a-z0-9-]+)*$/i,
        'url': /^(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?$/,
        'number': /^\s*(\-|\+)?(\d+|(\d*(\.\d*)))\s*$/,
        'date': /^(\d{4})-(\d{2})-(\d{2})$/,
        'alpha': /^[a-z ._-]+$/i,
        'alphanum': /^[a-z0-9_]+$/i,
        'password': /^[\x00-\xff]+$/,
        'integer': /^[-+]?[0-9]+$/,
        'tel': /^[\d\s ().-]+$/
    }


function _require() {
    if (utils.isBoolean(this.value)) {
        this.valid = false
        this.error = this._label + "不能为空"
    } else {
        this.pass()
    }
}


function _len(val, t) {
    var len = 0,
        tip = ''
    switch(this._type) {
        case 'number':
        case 'integer':
            len = parseInt(this.value)
            break
        default:
            len = this.value.length
            tip = '长度'
            break
    }
    if (t === 'min')
        this.valid = len >= val
    else
        this.valid = len <= val

    if (!this.valid)
        this.error = this._label + tip + "不能" + (t === 'min' ? "小" : "大") + "于" + val
    else
        this.error = ''
}

function maxlen(val) {
    return _len.call(this, val, 'max')
}

function minlen(val) {
    return _len.call(this, val, 'min')
}


function regex(reg) {
    if (reg.test(this.value)) {
        this.pass()
    } else {
        this.valid = false
        this.error = this._label + '格式不正确'
    }
}



module.exports = {
    template: require('./form-control.html'),
    replace: true,

    methods: {
        check: function () {
            this.valid = true
            var i = this.checkList.length,
                ck

            if (this.valid && REGS[this._type])
                regex.call(this, REGS[this._type])
            //if (i === 0) return

            while(i-- && this.valid) {
                ck = this.checkList[i]
                switch(ck[0]) {
                    case 'max':
                        maxlen.call(this, ck[1])
                        break
                    case 'min':
                        minlen.call(this, ck[1])
                        break
                    case 'require':
                        _require.call(this)
                        break
                }
            }
        },

        pass: function () {
            this.valid = true
            this.error = ''
        }
    },

    data: {},

    created: function () {
        this.id = utils.nextUid()
        this.pass()
        this.checkList = []

        // set attr
        utils.forEach(['label', 'src', 'text', 'name', 'rows', 'readonly', 'options', 'inline'], function (attr) {
            this['_' + attr] = this.$el.getAttribute(attr)
            this.$el.removeAttribute(attr)
        }.bind(this))

        // validate
        utils.forEach(['max', 'min', 'require'], function (attr) {
            if (this.$el.hasAttribute(attr)) 
                this.checkList.push([attr, this.$el.getAttribute(attr)])
            this.$el.removeAttribute(attr)
        }.bind(this))

        this._type = this.$el.getAttribute('type') || 'empty'
        this._col = getCol(this.$el.getAttribute('col'), this._label)
        this._content = undefined === TEMPLATES[this._type] ? TEMPLATES['default'] : TEMPLATES[this._type]
        this._content += '<p class="help-block">{{error}}</p>';

        // clear
        utils.forEach(['type', 'col'], function (attr) {
            this.$el.removeAttribute(attr)
        }.bind(this))
    },

    ready: function () {
        this.$watch('value', function () {
            this.check()
        }.bind(this))
    }
}
