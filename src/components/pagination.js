module.exports = {
    template: require('./pagination.html'),
    replace: true,
    methods: {
        compose: function () {
            var page = this.page || 1,
                size = this.size,
                max  = this.max = Math.ceil(this.total / size)

            this.pages = []
            for (var i = 1; i <= max; i++) {
                if (i === 1 || i === max || Math.abs(i-page) < 5)
                    this.pages.push(i)
            }

        },
        change: function (page) {
            this.page = page
            this.compose()
            if (this.$parent && this.$parent.update)
                this.$parent.update()
        }
    },
    data: {
        page: 1,
        size: 20,
        total: 0,
        step: 5,
        max: 1,
        pages: []
    },
    created: function () {
        this.compose()
        this.showPageinfo = this.$el.getAttribute('pageinfo') === 'true'
    },
    ready: function () {
        var self = this
        this.$watch('total', function () {
            self.compose()
        })
    }
}
