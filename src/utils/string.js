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

module.exports = {
    substitute: substitute,
    format: format
}
