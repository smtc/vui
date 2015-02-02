var utils = require('../utils'),
    lang  = require('../lang/lang')

function getCol(str, label) {
    var col = [2, 6]

    if (str) {
        var ss = str.split(',')
        utils.forEach(ss, function (s, i) {
            try {
                ss[i] = parseInt(s)
            } catch (e) {}
        })
        if (ss[0] === 0)
            col = [0, 0]
        else 
            col = [ ss[0] || 2, ss[1] || 6 ]
    }

    return col
}

var TEMPLATES = {
        'submit': '<button class="btn" type="submit">{{_text}}</button>',
        'button': '<button class="btn" type="button">{{_text}}</button>',
        'file': '<div class="file" v-component="file" v-with="value:value, data:data"></div>',
        'image': '<div class="image" v-component="image" src="{{src}}" v-with="value:value, data:data"></div>',
        'radio': '<div type="radio" v-component="option" name="{{_name}}" v-with="value:value" inline="{{_inline}}" src="{{_src}}" options="{{_options}}"></div>',
        'checkbox': '<div type="checkbox" v-component="option" name="{{_name}}" v-with="value:value" inline="{{_inline}}" src="{{_src}}" options="{{_options}}"></div>',
        'textarea': '<textarea class="form-control col-sm-{{_col[1]}}" v-attr="readonly:_readonly" name="{{_name}}" v-model="value" rows="{{_rows}}"></textarea>',
        'select': '<div class="form-control select col-sm-{{_col[1]}}" src="{{_src}}" v-with="value:value" v-component="select"></div>',
        'mult-select': '<div class="form-control select col-sm-{{_col[1]}}" src="{{_src}}" single="{{_single}}" v-with="value:value" v-component="mult-select"></div>',
        'tree': '<ul v-with="value:value" selectable="{{_selectable}}" select="{{_select}}" src="{{_src}}" v-component="tree"></ul>',
        'date': '<div class="form-control date col-sm-{{_col[1]}}" unixtime="{{_unixtime}}" v-component="date" v-with="date:value" id="{{id}}" name="{{_name}}"></div>',
        'integer': '<input class="form-control col-sm-{{_col[1]}}" v-attr="readonly:_readonly" id="{{id}}" v-model="value" name="{{_name}}" type="text" />',
        'alpha': '<input class="form-control col-sm-{{_col[1]}}" v-attr="readonly:_readonly" id="{{id}}" v-model="value" name="{{_name}}" type="text" />',
        'alphanum': '<input class="form-control col-sm-{{_col[1]}}" v-attr="readonly:_readonly" id="{{id}}" v-model="value" name="{{_name}}" type="text" />',
        'progress': '<div v-with="progress:value" class="col-sm-{{_col[1]}}" v-component="progress" />',
        'default': '<input class="form-control col-sm-{{_col[1]}}" v-attr="readonly:_readonly" id="{{id}}" v-model="value" name="{{_name}}" type="{{_type}}" />',
        'empty': ''
    },

    REGS = {
        'email': /^[a-z0-9!#$%&'*+/=?^_`{|}~.-]+@[a-z0-9-]+(\.[a-z0-9-]+)*$/i,
        'url': /^(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?$/,
        'number': /^\s*(\-|\+)?(\d+|(\d*(\.\d*)))\s*$/,
        //'date': /^(\d{4})-(\d{2})-(\d{2})$/,
        'alpha': /^[a-z ._-]+$/i,
        'alphanum': /^[a-z0-9_]+$/i,
        'password': /^[\x00-\xff]+$/,
        'integer': /^[-+]?[0-9]+$/,
        'tel': /^[\d\s ().-]+$/
    },

    MSGS,

    TIPS

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
        len = this.value ? this.value.toString().length : 0
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


function _allowExt(exts) {
    if (!this.value || !exts) return this.pass()
    if ('string' === typeof exts) exts = exts.split(',')
    var val = this.value.substring(this.value.lastIndexOf('.') + 1)
    if (exts.indexOf(val) >= 0)
        this.pass()
    else
        this.fail('exts') 
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
            case 'exts':
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
                    case 'exts':
                        _allowExt.call(this, ck[1])
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

    data: {
        src: ''
    },

    created: function () {
        TIPS = lang.get('validation.tips')
        MSGS = lang.get('validation.msgs')

        this.id = utils.nextUid()
        this.data = null
        this.pass()
        this.checkList = []

        // set attr
        utils.forEach(['label', 'src', 'text', 'name', 'rows', 'readonly', 'options', 'inline', 'single', 'tip', 'selectable', 'select', 'unixtime'], function (attr) {
            this['_' + attr] = this.$el.getAttribute(attr)
            this.$el.removeAttribute(attr)
        }.bind(this))

        // validate
        utils.forEach(['max', 'min', 'maxlen', 'minlen', 'require', 'exts'], function (attr) {
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

        this.$watch('src', function () {
console.log(this.src)
        }.bind(this))

    },

    ready: function () {
        if (this.$el.hasAttribute('value'))
            this.value = this.$el.getAttribute('value')

        this.$watch('value', function () {
            this.check()
        }.bind(this))

        if (this._type === 'file' || this._type === 'image') {
            this.$parent.files.push(this)
        }
    },

    computed: {
        labelClass: function () {
            return this._col[0] === 0 ? "" : "col-sm-" + this._col[0]
        },
        controlClass: function () {
            return this._col[0] === 0 ? "" : "col-sm-" + (12 - this._col[0])
        }
    }
}
