var _               = require('../lib').underscore,
    urlParsingNode  = document.createElement("a"),
    html5Mode       = false

/////////////////////////////////////////////////

/**
 * Tries to decode the URI component without throwing an exception.
 *
 * @private
 * @param str value potential URI component to check.
 * @returns {boolean} True if `value` can be decoded
 * with the decodeURIComponent function.
 */
function tryDecodeURIComponent(value) {
    try {
        return decodeURIComponent(value);
    } catch(e) {
        // Ignore any invalid uri component
    }
}


/**
 * Parses an escaped url query string into key-value pairs.
 * @returns {Object.<string,boolean|Array>}
 */
function parseKeyValue(/**string*/keyValue) {
    var obj = {}, key_value, key;
    _.each((keyValue || "").split('&'), function(keyValue) {
        if ( keyValue ) {
            key_value = keyValue.split('=');
            key = tryDecodeURIComponent(key_value[0]);
            if ( !_.isUndefined(key) ) {
                var val = _.isUndefined(key_value[1]) ? true : tryDecodeURIComponent(key_value[1]);
                if (!obj[key]) {
                    obj[key] = val;
                } else if(_.isArray(obj[key])) {
                    obj[key].push(val);
                } else {
                    obj[key] = [obj[key],val];
                }
            }
        }
    });
    return obj;
}

function toKeyValue(obj) {
    var parts = [];
    _.each(obj, function(value, key) {
        if (_.isArray(value)) {
            _.each(value, function(arrayValue) {
                parts.push(encodeUriQuery(key, true) +
                    (arrayValue === true ? '' : '=' + encodeUriQuery(arrayValue, true)));
            });
        } else {
            parts.push(encodeUriQuery(key, true) +
                (value === true ? '' : '=' + encodeUriQuery(value, true)));
        }
    });
    return parts.length ? parts.join('&') : '';
}


/**
 * We need our custom method because encodeURIComponent is too aggressive and doesn't follow
 * http://www.ietf.org/rfc/rfc3986.txt with regards to the character set (pchar) allowed in path
 * segments:
 *    segment       = *pchar
 *    pchar         = unreserved / pct-encoded / sub-delims / ":" / "@"
 *    pct-encoded   = "%" HEXDIG HEXDIG
 *    unreserved    = ALPHA / DIGIT / "-" / "." / "_" / "~"
 *    sub-delims    = "!" / "$" / "&" / "'" / "(" / ")"
 *                     / "*" / "+" / "," / ";" / "="
 */
function encodeUriSegment(val) {
    return encodeUriQuery(val, true).
        replace(/%26/gi, '&').
        replace(/%3D/gi, '=').
        replace(/%2B/gi, '+');
}


/**
 * This method is intended for encoding *key* or *value* parts of query component. We need a custom
 * method because encodeURIComponent is too aggressive and encodes stuff that doesn't have to be
 * encoded per http://tools.ietf.org/html/rfc3986:
 *    query       = *( pchar / "/" / "?" )
 *    pchar         = unreserved / pct-encoded / sub-delims / ":" / "@"
 *    unreserved    = ALPHA / DIGIT / "-" / "." / "_" / "~"
 *    pct-encoded   = "%" HEXDIG HEXDIG
 *    sub-delims    = "!" / "$" / "&" / "'" / "(" / ")"
 *                     / "*" / "+" / "," / ";" / "="
 */
function encodeUriQuery(val, pctEncodeSpaces) {
    return encodeURIComponent(val).
        replace(/%40/gi, '@').
        replace(/%3A/gi, ':').
        replace(/%24/g, '$').
        replace(/%2C/gi, ',').
        replace(/%20/g, (pctEncodeSpaces ? '%20' : '+'));
}


var msie = parseInt((/msie (\d+)/.exec(navigator.userAgent.toLowerCase()) || [])[1]);
if (_.isNaN(msie)) {
    msie = parseInt((/trident\/.*; rv:(\d+)/.exec(navigator.userAgent.toLowerCase()) || [])[1]);
}

function urlResolve(url, fixHash) {
    var href = url,
        pathname,
        pathindex,
        colon = []

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

    pathname = urlParsingNode.pathname
    pathindex = pathname.indexOf(':')
    if (pathindex >= 0) {
        var cs = pathname.substr(pathindex + 1)
        colon = cs.split('/')
        pathname = pathname.substr(0, pathindex)
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
        colon: colon,
        pathname: (urlParsingNode.pathname.charAt(0) === '/')
            ? urlParsingNode.pathname
            : '/' + urlParsingNode.pathname
    };
}

function format(str, arr) {
    return str.replace(/{(\d+)}/g, function(match, number) { 
        return typeof arr[number] !== 'undefined'
            ? arr[number] 
            : match
    })
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
}


function url(href, replace) {
    if (href) {
        // setter
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
    } else {
        // getter
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
        _search = parseKeyValue(raw.search)

    switch(arguments.length) {
        case 0:
            return parseKeyValue(raw.search)
        case 1:
            if (_.isString(query))
                query = toKeyValue(query)
            _search = query
            break
        default:
            if (null === value || _.isUndefined(value))
                delete _search[query]
            else
                _search[query] = value
    }
    raw.search = toKeyValue(_search)
    return compose(raw)
}

function hash(value) {
    var raw = urlResolve(url(), !html5Mode)
    if (arguments.length === 0)
        return raw.hash

    raw.hash = value
    return compose(raw)
}


module.exports = {
    urlResolve: urlResolve,
    parseKeyValue: parseKeyValue,
    toKeyValue: toKeyValue,
    format: format,
    search: search,
    hash: hash,
    url: url,
    setMode: setMode,
    node: node
}
