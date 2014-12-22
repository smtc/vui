var utils = require('../utils'),
    lang  = require('../lang'),
    _     = require('../lib').underscore


var STAGE = { DAY:1, MONTH:2, YEAR:3 },
    OPTIONS = {
        header: lang.get('date.header'),
        weekday: lang.get('date.weekday'),
        month: lang.get('date.month'),
        format: lang.get('date.format')
    }

function Day(d) {
    this.year = d.getFullYear()
    this.month = d.getMonth()
    this.date = d.getDate()
    this.weekday = d.getDay()
    this.timestamp = Math.ceil(d.getTime() / 1000)
    this.raw = d
    this.str = utils.formatTime(d, OPTIONS.format)
}

module.exports = {
    template: require('./date.html'),
    replace: true,
    paramAttributes: ['placeholder', 'unixtime'],

    methods: {
        open: function () {
            if (this.$open) return
            this.$open = true

            this.stage = STAGE.DAY
            this.showDate = _.clone(this.currentDate)

            // 需要设置延时，否则会点击open时会触发关闭事件
            // pc端可以用mouseup处理不需要延时，没测试touch是否响应
            setTimeout(function () {
                this.draw()
                utils.addClass(this.$el, 'active')
                document.body.addEventListener('click', this.$closeHandle)
            }.bind(this), 50)
        },

        close: function () {
            if (!this.$open) return
            this.$open = false

            utils.removeClass(this.$el, 'active')
            document.body.removeEventListener('click', this.$closeHandle)
        },

        set: function (d) {
            this.value = this.unixtime ? d.timestamp : d.str
            this.currentDate = {
                year: d.year,
                month: d.month,
                date: d.date
            }

            setTimeout(function () {
                this.close()
            }.bind(this), 50)
        },

        setYear: function (y) {
            this.showDate.year = y
            this.stage = STAGE.MONTH
        },

        setMonth: function (m) {
            this.showDate.month = m
            this.stage = STAGE.DAY
            this.draw()
        },

        change: function (m) {
            switch (this.stage) {
                case STAGE.YEAR:
                    this.changeYear(m)
                    break
                case STAGE.MONTH:
                    this.showDate.year += m
                    break
                case STAGE.DAY:
                    this.changeMonth(m)
                    break
            }
        },

        changeMonth: function (m) {
            var cd = this.showDate
            cd.month += m

            if (cd.month < 0) {
                cd.month += 12
                cd.year -= 1
            } else if (cd.month > 11) {
                cd.month -= 12
                cd.year += 1
            }

            this.draw()
        },

        changeYear: function (m) {
            var year = this.showDate.year += 12 * m,
                years = []

            for (var i=year-12, j=year+12; i <= j; i++) {
                years.push(i)
            }
            this.years = years
        },

        stageToggle: function () {
            this.stage++
            if (this.stage > 3)
                this.stage = 1
        },

        draw: function () {
            var cd = this.showDate,
                year = cd.year,
                month = cd.month,
                first = new Date(cd.year, cd.month, 1),
                end = new Date(cd.year, cd.month + 1, 0),
                min = 1 - first.getDay(),
                max = (Math.ceil((end.getDate() - min + 1) / 7) * 7),
                days = []

            for (var day, i = 0; i < max; i++) {
                day = new Date(year, month, i+min)
                days.push(new Day(day))
            }

            this.days = days
        }
    },
    
    data: function () {
        return {
            value: null,
            years: [],
            days: [],
            currentDate: {},
            showDate: {},
            stage: STAGE.DAY,
            today: new Date(),
            options: OPTIONS
        }
    },

    computed: {
        text: function () {
            if (this.value)
                return this.unixtime ? utils.formatTime(new Date(this.value * 1000), this.options.format) : this.value
        },
        header: function () {
            var sd = { year: this.showDate.year, month: '' }
            if (this.stage === STAGE.DAY) sd.month = this.options.month[this.showDate.month]
            var temp = _.template(OPTIONS.header)
            return temp(sd)
        },
        // 兼容 v0.10.0
        date: {
            get: function () {
                return this.value
            },
            set: function (d) {
                this.value = d
            }
        }
    },

    ready: function () {
        var self = this,
            d = new Date()

        if (this.unixtime && this.value) {
            if (typeof this.value === 'string')
                this.value = parseInt(this.value)
            this.value = this.value * 1000
        }

        if (this.value)
            d = new Date(this.value)

        this.currentDate = {
            year: d.getFullYear(),
            month: d.getMonth(),
            date: d.getDate()
        }

        this.showDate = _.clone(this.currentDate)

        this.draw()
        this.changeYear(0)

        // 点击页面空白关闭
        this.$closeHandle = function (event) {
            if (utils.isDescendant(self.$el, event.target))
                return

            self.close()
        }
    }

}
