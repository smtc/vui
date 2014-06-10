var utils           = require("./utils"),
    urlResolve      = utils.urlResolve,
    originUrl       = urlResolve(window.location.href, true),
    root            = originUrl.pathname,
    lastBrowserUrl  = originUrl,
    html5Mode       = false


/**
 * Parse a request URL and determine whether this is a same-origin request as the application document.
 *
 * @param {string|object} requestUrl The url of the request as a string that will be resolved
 * or a parsed URL object.
 * @returns {boolean} Whether the request is for the same origin as the application document.
 */
function urlIsSameOrigin(requestUrl) {
    var parsed = (isString(requestUrl)) ? urlResolve(requestUrl) : requestUrl
    return (parsed.protocol === originUrl.protocol &&
            parsed.host === originUrl.host)
}


function url(url, replace) {
    // Android Browser BFCache causes location, history reference to become stale.
    //if (location !== window.location) location = window.location
    if (history !== window.history) history = window.history

    // setter
    if (url) {
        if (lastBrowserUrl == url) return
        lastBrowserUrl = url
        if (html5Mode) {
            if (replace) history.replaceState(null, '', url)
            else {
                history.pushState(null, '', url)
                // Crazy Opera Bug: http://my.opera.com/community/forums/topic.dml?id=1185462
                //baseElement.attr('href', baseElement.attr('href'))
            }
        } else {
            var c = url.charAt(0)
            if (c != '/' && c != '.')
            url = "#!/" + url
            if (replace)
                window.location.replace(url)
            else
                window.location.href = url
        }
        return self
        // getter
    } else {
        // - newLocation is a workaround for an IE7-9 issue with location.replace and location.href
        //   methods not updating location.href synchronously.
        // - the replacement is a workaround for https://bugzilla.mozilla.org/show_bug.cgi?id=407172
        url = window.location.href.replace(/%27/g,"'")
        return url
    }
}


module.exports = {
    url: url
}

