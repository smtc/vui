module.exports = {
    template: require('./progress.html'),
    data: {
        progress: 0,
        width: 0
    },
    ready: function () {
        var self = this,
            el = this.$el.querySelector('.progress'),
            handle = this.$el.querySelector('.progress-handle'),
            tip = this.$el.querySelector('.progress-tip'),
            bar = this.$el.querySelector('.progress-bar'),
            _left = 0,
            _width = 0,
            _last = 0,
            _start = false,
            _min = parseInt(this.$el.getAttribute('min')) || 0,
            _max = parseInt(this.$el.getAttribute('max')) || 100
        
        if (typeof this.progress === 'string') 
            this.progress = parseInt(this.progress)
        this.progress = this.progress || 0
        this.width = this.progress / (_max - _min) * 100

        this.$drag = this.$el.getAttribute('drag') === 'true' 
        this.unit = this.$el.getAttribute('unit') || '%'

        if (this.$drag) {
            var getPer = function (left) {
                if (_width === 0)
                    _width = el.offsetWidth
                var per = Math.ceil(left * 100 / _width) 
                if (per >= 99) per = 100
                self.width = per
                self.progress = Math.ceil((_max - _min) * per / 100) + _min
                return per
            }

            var start = function (ev) {
                if (_width === 0)
                    _width = el.offsetWidth
                if (_left === 0)
                    _left = ev.clientX - ev.offsetX - handle.offsetLeft
                _start = true
            }

            var end = function (ev) {
                _start = false
            }

            var move = function (ev) {
                if (!_start) return

                var left = ev.clientX - _left
                if (left < 0) left = 0
                if (left > _width) left = _width
                handle.style.left = left + 'px'
                _set(left)
            }

            var _set = function (left) {
                bar.style.width = getPer(left) + '%'
            }

            var set = function (ev) {
                handle.style.left = ev.offsetX + 'px'
            }

            handle.addEventListener('mousedown', start, false)
            handle.addEventListener('mousemove', move, false)
            handle.addEventListener('mouseup', end, false)
            el.addEventListener('mouseout', end, false)
        } else {
            var showTip = function (evt) {
                var left = evt.offsetX
                if (_width === 0)
                    _width = el.offsetWidth
                var per = Math.ceil(left * 100 / _width) 
                self.tip = Math.ceil((_max - _min) * per / 100) + _min
                tip.style.left = per + '%'
            }

            var set = function (evt) {
                self.progress = self.tip
            }

            el.addEventListener('mousemove', showTip, false)
            el.addEventListener('click', set, false)
        }

        this.$watch('progress', function (value) {
            this.width = value / (_max - _min) * 100
        }.bind(this))
    }
}
