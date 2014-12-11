function substitute(str, obj) {
    return str.replace((/\\?\{([^{}]+)\}/g), function(match, name){
        if (match.charAt(0) === '\\') return match.slice(1);
        return (obj[name] != null) ? obj[name] : '';
    })
}

function format(str, arr) {
    return str.replace(/{(\d+)}/g, function(match, number) { 
        return typeof arr[number] !== 'undefined'
            ? arr[number] 
            : match
    })
}

function hashCode(obj) {
    if (null === obj || undefined === obj) obj = ""
    if ("string" !== typeof obj) obj = obj.toString()

    var hash = 0, i, chr, len;
    if (obj.length === 0) return hash;
    for (i = 0, len = obj.length; i < len; i++) {
        chr   = obj.charCodeAt(i);
        hash  = ((hash << 5) - hash) + chr;
        hash |= 0; // Convert to 32bit integer
    }
    return hash;
}

module.exports = {
    substitute: substitute,
    format: format,
    hashCode: hashCode
}
