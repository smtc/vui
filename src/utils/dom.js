var hasClassList    = 'classList' in document.documentElement

/**
 *  add class for IE9
 *  uses classList if available
 */
function addClass(el, cls) {
    if (hasClassList) {
        el.classList.add(cls)
    } else {
        var cur = ' ' + el.className + ' '
        if (cur.indexOf(' ' + cls + ' ') < 0) {
            el.className = (cur + cls).trim()
        }
    }
}

/**
 *  remove class for IE9
 */
function removeClass(el, cls) {
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
}

function hasClass(el, cls) {
    var cur = ' ' + el.className + ' '
    return cur.indexOf(' ' + cls + ' ') >= 0
}

function toggleClass(el, cls) {
    if (hasClass(el, cls))
        removeClass(el, cls)
    else
        addClass(el, cls)
}

function isDescendant(parent, child) {
     var node = child.parentNode;
     while (node != null) {
         if (node === parent) {
             return true;
         }
         node = node.parentNode;
     }
     return false;
}

module.exports = {
    isDescendant: isDescendant,
    addClass: addClass,
    hasClass: hasClass,
    removeClass: removeClass,
    toggleClass: toggleClass
}
