module.exports = {

    bind: function () {
        this.el.innerHTML = this.compiler.data[this.key]
        this.el.setAttribute('contentEditable', true)
        this.el.addEventListener('keyup', function () {
            this.compiler.data[this.key] = this.el.innerHTML
        }.bind(this))
    },

    unbind: function (value) {
        this.el.innerHTML = value
    }

}
