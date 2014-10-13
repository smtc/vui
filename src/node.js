var hasClassList    = 'classList' in document.documentElement,
    urlParsingNode  = document.createElement("a")


/**
 * IE 11 changed the format of the UserAgent string.
 * See http://msdn.microsoft.com/en-us/library/ms537503.aspx
 */
var msie = parseInt((/msie (\d+)/.exec(navigator.userAgent.toLowerCase()) || [])[1]);
if (isNaN(msie)) {
    msie = parseInt((/trident\/.*; rv:(\d+)/.exec(navigator.userAgent.toLowerCase()) || [])[1]);
}

/**
 *
 * Implementation Notes for non-IE browsers
 * ----------------------------------------
 * Assigning a URL to the href property of an anchor DOM node, even one attached to the DOM,
 * results both in the normalizing and parsing of the URL.  Normalizing means that a relative
 * URL will be resolved into an absolute URL in the context of the application document.
 * Parsing means that the anchor node's host, hostname, protocol, port, pathname and related
 * properties are all populated to reflect the normalized URL.  This approach has wide
 * compatibility - Safari 1+, Mozilla 1+, Opera 7+,e etc.  See
 * http://wcg.aptana.com/reference/html/api/HTMLAnchorElement.html
 *
 * Implementation Notes for IE
 * ---------------------------
 * IE >= 8 and <= 10 normalizes the URL when assigned to the anchor node similar to the other
 * browsers.  However, the parsed components will not be set if the URL assigned did not specify
 * them.  (e.g. if you assign a.href = "foo", then a.protocol, a.host, etc. will be empty.)  We
 * work around that by performing the parsing in a 2nd step by taking a previously normalized
 * URL (e.g. by assigning to a.href) and assigning it a.href again.  This correctly populates the
 * properties such as protocol, hostname, port, etc.
 *
 * IE7 does not normalize the URL when assigned to an anchor node.  (Apparently, it does, if one
 * uses the inner HTML approach to assign the URL as part of an HTML snippet -
 * http://stackoverflow.com/a/472729)  However, setting img[src] does normalize the URL.
 * Unfortunately, setting img[src] to something like "javascript:foo" on IE throws an exception.
 * Since the primary usage for normalizing URLs is to sanitize such URLs, we can't use that
 * method and IE < 8 is unsupported.
 *
 * References:
 *   http://developer.mozilla.org/en-US/docs/Web/API/HTMLAnchorElement
 *   http://wcg.aptana.com/reference/html/api/HTMLAnchorElement.html
 *   http://url.spec.whatwg.org/#urlutils
 *   https://github.com/angular/angular.js/pull/2902
 *   http://james.padolsey.com/javascript/parsing-urls-with-the-dom/
 *
 * @function
 * @param {string} url The URL to be parsed.
 * @description Normalizes and parses a URL.
 * @returns {object} Returns the normalized URL as a dictionary.
 *
 *   | member name   | Description    |
 *   |---------------|----------------|
 *   | href          | A normalized version of the provided URL if it was not an absolute URL |
 *   | protocol      | The protocol including the trailing colon                              |
 *   | host          | The host and port (if the port is non-default) of the normalizedUrl    |
 *   | search        | The search params, minus the question mark                             |
 *   | hash          | The hash string, minus the hash symbol
 *   | hostname      | The hostname
 *   | port          | The port, without ":"
 *   | pathname      | The pathname, beginning with "/"
 *
 */
function urlResolve(url, fixHash) {
    var href = url,
        pathname,
        colon

    if (msie) {
        // Normalize before parse.  Refer Implementation Notes on why this is
        // done in two steps on IE.
        urlParsingNode.setAttribute("href", href);
        href = urlParsingNode.href;
    }

    urlParsingNode.setAttribute('href', href);

    if (fixHash && urlParsingNode.href.indexOf('#!/') > 0) {
        pathname = urlParsingNode.pathname;
        var end = pathname.lastIndexOf('/');
        pathname = pathname.substr(0, end+1);
        href = pathname + urlParsingNode.hash.substr(3);
        urlParsingNode.setAttribute('href', href);
        href = urlParsingNode.href;
    }

    if (pathname.indexOf(':') >= 0) {
        var cstr = pathname.substr(pathname.indexOf(':') + 1)
    }

    // urlParsingNode provides the UrlUtils interface - http://url.spec.whatwg.org/#urlutils
    return {
        href: urlParsingNode.href,
        protocol: urlParsingNode.protocol ? urlParsingNode.protocol.replace(/:$/, '') : '',
        host: urlParsingNode.host,
        search: urlParsingNode.search ? urlParsingNode.search.replace(/^\?/, '') : '',
        hash: urlParsingNode.hash ? urlParsingNode.hash.replace(/^#/, '') : '',
        hostname: urlParsingNode.hostname,
        port: urlParsingNode.port,
        pathname: (urlParsingNode.pathname.charAt(0) === '/')
            ? urlParsingNode.pathname
            : '/' + urlParsingNode.pathname
    };
}


if(typeof String.prototype.trim !== 'function') {
    String.prototype.trim = function() {
        return this.replace(/^\s+|\s+$/g, ''); 
    }
}


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
         if (node == parent) {
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
    toggleClass: toggleClass,
    urlResolve: urlResolve
}
