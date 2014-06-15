/*
 * superagent，增加了token
 */
var request 	= require("superagent"),
    Request     = request.Request,
	token  		= null

// 获取token
function getToken() {
	token = token === null 
			? localStorage.getItem("authentication")
			: token
    console.log(token)
	return token
}

function setToken(t) {
    if (!t) return
	token = t
	localStorage.setItem("authentication" , t)
}

// 重写 callback，获取token
Request.prototype.callback = function(err, res){
  	var fn = this._callback
  	if (2 === fn.length) return fn(err, res)
  	if (err) return this.emit('error', err)
    setToken(res.header.authentication)
  	fn(res)
}

// 重写superagent的request方法，加入oauth
function request(method, url) {
    console.log(url)
    var req
  	// url first
  	if (1 === arguments.length || 'function' === typeof url)
    	req = new Request('GET', method)
    else
        req = new Request(method, url)

    if (getToken()) req.set('authentication', token)

  	// callback
  	if ('function' === typeof url)
    	return req.end(url)

  	return req
}

module.exports = request
