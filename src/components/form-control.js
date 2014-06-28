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
    'radios': '<div class="radio-inline"><label><input type="radio" name="{{_name}}" v-model="value" /> {{_text}}</label></div>',
    'checkbox': '<div class="checkbox"><label><input type="checkbox" name="{{_name}}" v-model="value" /> {{_text}}</label></div>',
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
        this._type = this.$el.getAttribute('type') || 'empty'
        this._label = this.$el.getAttribute('label')
        this._col = getCol(this.$el.getAttribute('col'), this._label)
        this._src = this.$el.getAttribute('src')
        this._rows = this.$el.getAttribute('rows')
        this._text = this.$el.getAttribute('text')
        this._name = this.$el.getAttribute('name')
        this._readonly = this.$el.getAttribute('readonly')
        this._content = undefined === TEMPLATES[this._type] ? TEMPLATES['default'] : TEMPLATES[this._type]

        // clear
        utils.forEach(['type', 'label', 'col', 'src', 'text', 'name', 'rows', 'readonly'], function (attr) {
            this.$el.removeAttribute(attr)
        }.bind(this))
    }
}
