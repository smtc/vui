/*
 * 扩展 vui.utils
 */
var utils 	    = require("vue").require('utils')

utils.hasClass = function (el, cls) {
    var cur = ' ' + el.className + ' '
    return cur.indexOf(' ' + cls + ' ') >= 0
}

utils.toggleClass = function (el, cls) {
    if (utils.hasClass(el, cls))
        utils.removeClass(el, cls)
    else
        utils.addClass(el, cls)
}

module.exports = utils
