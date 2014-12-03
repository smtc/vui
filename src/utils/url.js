var _               = require('../lib').underscore,
    urlParsingNode  = document.createElement("a")

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

module.exports = {
    urlResolve: urlResolve,
    format: format
}
