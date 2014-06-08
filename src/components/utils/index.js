/*
 * 
 */
var hasClassList = 'classList' in document.documentElement

var utils = module.exports = {
    /**
     *  add class for IE9
     *  uses classList if available
     */
    addClass: function (el, cls) {
        if (hasClassList) {
            el.classList.add(cls)
        } else {
            var cur = ' ' + el.className + ' '
            if (cur.indexOf(' ' + cls + ' ') < 0) {
                el.className = (cur + cls).trim()
            }
        }
    },

    /**
     *  remove class for IE9
     */
    removeClass: function (el, cls) {
        if (hasClassList) {
            el.classList.remove(cls)
        } else {
            var cur = ' ' + el.className + ' ',
                tar = ' ' + cls + ' '
            while (cur.indexOf(tar) >= 0) {
                cur = cur.replace(tar, ' ')
            }
            el.className = cur.trim()
        }
    },

    hasClass: function (el, cls) {
        var cur = ' ' + el.className + ' '
        return cur.indexOf(' ' + cls + ' ') >= 0
    },

    toggleClass: function (el, cls) {
        if (utils.hasClass(el, cls))
            utils.removeClass(el, cls)
        else
            utils.addClass(el, cls)
    }

}

