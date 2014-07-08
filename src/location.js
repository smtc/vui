var utils            = require("./utils"),
    encodeUriSegment = utils.encodeUriSegment,
    urlResolve       = require('./node').urlResolve,
    lastBrowserUrl   = originUrl,
    html5Mode        = false,
    originUrl        = urlResolve(window.location.href, true),
    isUndefined      = utils.isUndefined,
    _location


/**
 * Parse a request URL and determine whether this is a same-origin request as the application document.
 *
 * @param {string|object} requestUrl The href of the request as a string that will be resolved
 * or a parsed URL object.
 * @returns {boolean} Whether the request is for the same origin as the application document.
 */
function hrefIsSameOrigin(requestUrl) {
    var parsed = (utils.isString(requestUrl)) ? urlResolve(requestUrl) : requestUrl
    return (parsed.protocol === originUrl.protocol &&
            parsed.host === originUrl.host)
}


/**
 * Encode path using encodeUriSegment, ignoring forward slashes
 *
 * @param {string} path Path to encode
 * @returns {string}
 */
function encodePath(path) {
    var segments = path.split('/'),
        i = segments.length

    while (i--) {
        segments[i] = encodeUriSegment(segments[i])
    }

    return segments.join('/')
}



function setMode(mode) {
    html5Mode = 'html5' === mode ? true : false
    return _location
}


function url(href, replace) {
    // Android Browser BFCache causes _location, history reference to become stale.
    //if (_location !== window.location) _location = window.location
    //if (history !== window.history) history = window.history

    // setter
    if (href) {
        //if (lastBrowserUrl === href) return
        //lastBrowserUrl = href
        if (html5Mode) {
            if (replace) window.history.replaceState(null, '', href)
            else {
                window.history.pushState(null, '', href)
                // Crazy Opera Bug: http://my.opera.com/community/forums/topic.dml?id=1185462
                //baseElement.attr('href', baseElement.attr('href'))
            }
        } else {
            var c = href.charAt(0)
            if (c !== '/' && c !== '.') href = "#!/" + href
            if (replace)
                window.location.replace(href)
            else
                window.location.href = href
        }
        return _location
        // getter
    } else {
        // - newL)cation is a workaround for an IE7-9 issue with _location.replace and _location.href
        //   methods not updating _location.href synchronously.
        // - the replacement is a workaround for https://bugzilla.mozilla.org/show_bug.cgi?id=407172
        return window.location.href.replace(/%27/g,"'")
    }
}

function node(fixHash) {
    return urlResolve(url(), fixHash)
}

// create url
function compose(raw) {
    var search = raw.search,
        hash = raw.hash,
        path,
        end

    if (html5Mode)
        end = raw.pathname
    else {
        path = urlResolve(url()).pathname
        path = path.slice(0, path.lastIndexOf('/') + 1)
        end = raw.pathname.replace(path, '')
    }

    end = encodePath(end)

    return url(end + (search ? '?' + search : '') + (hash ? '#' + encodeUriSegment(hash) : ''))
}

function search(query, value) {
    var raw = urlResolve(url(), !html5Mode),
        _search = utils.parseKeyValue(raw.search)

    switch(arguments.length) {
        case 0:
            return utils.parseKeyValue(raw.search)
        case 1:
            if (utils.isString(query))
                query = utils.toKeyValue(query)
            _search = query
            break
        default:
            if (null === value || isUndefined(value))
                delete _search[query]
            else
                _search[query] = value
    }
    raw.search = utils.toKeyValue(_search)
    return compose(raw)
}

function hash(value) {
    var raw = urlResolve(url(), !html5Mode)
    if (arguments.length === 0)
        return raw.hash

    raw.hash = value
    return compose(raw)
}


_location = module.exports = {
    setMode: setMode,
    search: search,
    hash: hash,
    url: url,
    node: node
}

