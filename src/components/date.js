var utils = require('../utils')

function pad(v) {
    v = v.toString()
    if (v.length === 1)
        v = '0' + v
    return v
}

function Day(d) {
    this.year = d.getFullYear()
    this.month = d.getMonth()
    this.date = d.getDate()
    this.weekday = d.getDay()
    this.str = this.year + '-' + pad(this.month + 1) + '-' + pad(this.date)
    this.timestamp = Math.ceil(d.getTime() / 1000)
}

var STATUS = { DAY:1, MONTH:2, YEAR:3 }

module.exports = {
    template: require('./date.html'),
    replace: true,
    paramAttributes: ['placeholder', 'unixtime'],

    methods: {
        open: function () {
            if (this.$open) return
            this.$open = true

            this.status = STATUS.DAY
            this.showDate = utils.copy(this.currentDate)

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

        set: function (day, event) {
            this.date = this.unixtime ? day.timestamp : day.str
            this.text = day.str
            this.currentDate = {
                year: day.year,
                month: day.month,
                day: day.date
            }

            setTimeout(function () {
                this.close()
            }.bind(this), 50)
        },

        setYear: function (y) {
            this.showDate.year = y
            this.status = STATUS.MONTH
        },

        setMonth: function (m) {
            this.showDate.month = m
            this.status = STATUS.DAY
            this.draw()
        },

        change: function (m) {
            switch (this.status) {
                case STATUS.YEAR:
                    this.changeYear(m)
                    break
                case STATUS.MONTH:
                    this.showDate.year += m
                    break
                case STATUS.DAY:
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
            var year = this.showDate.year += 12 * m

            this.years = []

            for (var i=year-12, j=year+12; i <= j; i++) {
                this.years.push(i)
            }
        },

        statusToggle: function () {
            this.status++
            if (this.status > 3)
                this.status = 1
        },

        draw: function () {
            var cd = this.showDate,
                year = cd.year,
                month = cd.month,
                first = new Date(cd.year, cd.month, 1),
                end = new Date(cd.year, cd.month + 1, 0),
                min = 1 - first.getDay(),
                max = (Math.ceil((end.getDate() - min + 1) / 7) * 7)

            this.days = []

            for (var date, i = 0; i < max; i++) {
                date = new Date(year, month, i+min)
                this.days.push(new Day(date))
            }

        }
    },
    
    data: {
        date: null,
        currentDate: {},
        showDate: {},
        status: STATUS.DAY,
        today: new Date()
    },

    created: function () {
        var self = this,
            d = new Date()

        if (this.$el.getAttribute('up') === 'true')
            this.pickerUp = true

        if (this.unixtime && this.date) {
            if (typeof this.date === 'string')
                this.date = parseInt(this.date)
            this.date = this.date * 1000
        }

        if (this.date)
            d = new Date(this.date)

        this.currentDate = {
            year: d.getFullYear(),
            month: d.getMonth(),
            day: d.getDate()
        }

        this.showDate = utils.copy(this.currentDate)

        this.draw()
        this.changeYear(0)

        // 点击页面空白关闭
        this.$closeHandle = function (event) {
            if (utils.isDescendant(self.$el, event.target))
                return

            self.close()
        }

        var inited = false
        this.$watch('date', function (value) {
            if (value)
                this.text = this.unixtime ? (new Date(value * 1000)).format("yyyy-MM-dd") : value
        }.bind(this))
    }

}
