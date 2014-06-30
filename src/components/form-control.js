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
    'default': '<input class="form-control" v-attr="readonly:_readonly" id="{{id}}" v-model="value" name="{{_name}}" type="{{_type}}" />',
    'empty': ''
}


module.exports = {
    template: require('./form-control.html'),
    replace: true,

    methods: {},

    data: {},

    created: function () {
        this.id = utils.nextUid()

        // set attr
        utils.forEach(['label', 'src', 'text', 'name', 'rows', 'readonly', 'options', 'inline'], function (attr) {
            this['_' + attr] = this.$el.getAttribute(attr)
            this.$el.removeAttribute(attr)
        }.bind(this))

        this._type = this.$el.getAttribute('type') || 'empty'
        this._col = getCol(this.$el.getAttribute('col'), this._label)
        this._content = undefined === TEMPLATES[this._type] ? TEMPLATES['default'] : TEMPLATES[this._type]

        // clear
        utils.forEach(['type', 'col'], function (attr) {
            this.$el.removeAttribute(attr)
        }.bind(this))

    }
}
