var request       = require('lib').request,
    templateCache = {}

// 从缓存中读取
function Template(src) {
    this.template = templateCache[src]
}
    
Template.prototype.end = function (fn) {
    fn(this.template)
}


// 从服务器读取
function TemplateRequest(src) {
    this.req = request.get(src)
    this.src = src
}

TemplateRequest.prototype.end = function (fn) {
    this.req.end(function (res) {
        fn(res.text)
        templateCache[this.src] = res.text
    }.bind(this))
}


request.getTemplate = function (src) {
    if (templateCache[src]) 
        return new Template(src)
    else
        return new TemplateRequest(src)
}

module.exports = request
