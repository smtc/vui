var utils = require('../utils')

function getCol(str, label) {
    var col = [2, 6]

    if (str) {
        var ss = str.split(',')
        utils.forEach(ss, function (s, i) {
            try {
                ss[i] = parseInt(s)
            } catch (e) {}
        })
        col = [ ss[0] || 2, ss[1] || 6 ]
    }

    return col
}

var TEMPLATES = {
        'submit': '<button class="btn" type="submit">{{_text}}</button>',
        'button': '<button class="btn" type="button">{{_text}}</button>',
        'radio': '<div type="radio" v-component="option" name="{{_name}}" v-with="value:value" inline="{{_inline}}" src="{{_src}}" options="{{_options}}"></div>',
        'checkbox': '<div type="checkbox" v-component="option" name="{{_name}}" v-with="value:value" inline="{{_inline}}" src="{{_src}}" options="{{_options}}"></div>',
        'textarea': '<textarea class="form-control col-sm-{{_col[1]}}" v-attr="readonly:_readonly" name="{{_name}}" v-model="value" rows="{{_rows}}"></textarea>',
        'select': '<div class="form-control select col-sm-{{_col[1]}}" src="{{_src}}" v-with="value:value" v-component="select"></div>',
        'tree': '<ul v-with="value:value" selectable="{{_selectable}}" select="{{_select}}" src="{{_src}}" v-component="tree"></ul>',
        'date': '<div class="form-control date col-sm-{{_col[1]}}" v-component="date" v-with="date:value" id="{{id}}" name="{{_name}}"></div>',
        'integer': '<input class="form-control col-sm-{{_col[1]}}" v-attr="readonly:_readonly" id="{{id}}" v-model="value" name="{{_name}}" type="text" />',
        'alpha': '<input class="form-control col-sm-{{_col[1]}}" v-attr="readonly:_readonly" id="{{id}}" v-model="value" name="{{_name}}" type="text" />',
        'alphanum': '<input class="form-control col-sm-{{_col[1]}}" v-attr="readonly:_readonly" id="{{id}}" v-model="value" name="{{_name}}" type="text" />',
        'default': '<input class="form-control col-sm-{{_col[1]}}" v-attr="readonly:_readonly" id="{{id}}" v-model="value" name="{{_name}}" type="{{_type}}" />',
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
    },

    MSGS = {
        'require': '不能为空',
        'maxlen': '长度不能大于{_maxlen}',
        'minlen': '长度不能小于{_minlen}',
        'maxlen_cb': '最多选{_maxlen}个选项',
        'minlen_cb': '最少选{_minlen}个选项',
        'max': '不能大于{_max}',
        'min': '不能小于{_min}',
        'regex': '格式不正确',
        'alpha': '只能包含英文字符，"-"，"_"',
        'alphanum': '只能包含数字、英文字符和"_"',
        'tip': '{_tip}'
    },

    TIPS = {
        'require': '必填',
        'max': '最大值{_max}',
        'min': '最小值{_min}',
        'maxlen': '最大长度{_maxlen}',
        'minlen': '最小长度{_minlen}',
        'maxlen_cb': '最多选{_maxlen}项',
        'minlen_cb': '最少选{_minlen}项'
    }


// 必填
function _require() {
    var empty = 'string' === (typeof this.value) ? this.value.trim() === '' : false
    if (empty || undefined === this.value || null === this.value || [] === this.value)
        this.fail('require')
    else
        this.pass()
}


function _len(val, t) {
    var len = 0,
        tip = ''
    if (this._type === 'checkbox')
        t += '_cb'
   
    if (t.indexOf('len') >= 0)
        len = this.value.length
    else
        len = parseInt(this.value) || 0

    if (t.indexOf('min') >= 0)
        this.valid = len >= val
    else
        this.valid = len <= val

    if (this.valid)
        this.pass()
    else
        this.fail(t)
}


// 正则
function regex(reg) {
    if (reg.test(this.value))
        this.pass()
    else
        this.fail(this._type, 'regex')
}

// 判断值相等（密码确认）
function equal() {
    if (this.value === this.equal)
        this.pass()
    else
        this.fail('tip')
}

// 设置初始提示
function initMessage() {
    var i = this.checkList.length,
        tip = '',
        t = ''
    while(i--) {
        t = this.checkList[i][0]
        switch(t) {
            case 'require':
                tip += TIPS[t] + ', '
                break
            case 'max':
            case 'maxlen':
            case 'min':
            case 'minlen':
                if (this._type === 'checkbox') t += '_cb'
                tip += TIPS[t] + ', '
                break
        }
    }

    // 设置type初始值
    switch(this._type) {
        case 'alpha':
        case 'alphanum':
            tip += MSGS[this._type] + ', '
            break
    }

    tip = (utils.substitute(tip, this) + (this._tip || '')).trim()
    var last = tip.lastIndexOf(',')

    if (last === tip.length - 1)
        tip = tip.substr(0, tip.length - 1)

    this.message = tip
}


module.exports = {
    template: require('./form-control.html'),
    replace: true,

    methods: {
        check: function () {
            this.valid = true
            var i = this.checkList.length,
                ck

            if (this.valid && REGS[this._type] && this.value)
                regex.call(this, REGS[this._type])

            if (this.valid && this.equal)
                equal.call(this)

            while(i-- && this.valid) {
                ck = this.checkList[i]
                switch(ck[0]) {
                    case 'max':
                    case 'maxlen':
                    case 'min':
                    case 'minlen':
                        _len.call(this, ck[1], ck[0])
                        break
                    case 'require':
                        _require.call(this)
                        break
                }
            }
        },

        pass: function () {
            this.valid = true
            this.message = ''
            this.$parent.controls[this.id] = true
        },

        fail: function (k, b) {
            this.valid = false
            this.message = utils.substitute(MSGS[k] || MSGS[b], this)
            this.$parent.controls[this.id] = false
        }
    },

    data: {},

    created: function () {
        this.id = utils.nextUid()
        this.pass()
        this.checkList = []

        // set attr
        utils.forEach(['label', 'src', 'text', 'name', 'rows', 'readonly', 'options', 'inline', 'tip', 'selectable', 'select'], function (attr) {
            this['_' + attr] = this.$el.getAttribute(attr)
            this.$el.removeAttribute(attr)
        }.bind(this))

        // validate
        utils.forEach(['max', 'min', 'maxlen', 'minlen', 'require'], function (attr) {
            if (!this.$el.hasAttribute(attr)) return

            this.checkList.push([attr, this.$el.getAttribute(attr)])
            this['_' + attr] = this.$el.getAttribute(attr) || true
            this.$el.removeAttribute(attr)
        }.bind(this))

        // type
        this._type = this.$el.getAttribute('type') || 'empty'
        this._col = getCol(this.$el.getAttribute('col'), this._label)
        this._content = undefined === TEMPLATES[this._type] ? TEMPLATES['default'] : TEMPLATES[this._type]
        if (this._inline && this._type !== 'checkbox' && this._type !== 'radio')
            this._content += '<p class="help-inline">{{message}}</p>';
        else
            this._content += '<p class="help-block">{{message}}</p>';

        // clear type
        utils.forEach(['type', 'col'], function (attr) {
            this.$el.removeAttribute(attr)
        }.bind(this))

        this.$on('check', function () {
            this.check()
        }.bind(this))

        // tip
        initMessage.call(this)

        this.$parent.controls[this.id] = true
    },

    ready: function () {
        this.$watch('value', function () {
            this.check()
        }.bind(this))
    }
}
