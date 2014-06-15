var express = require('express'),  
    app     = express(),
    isStart = false 
  
app.get('/api/oauth/test', function (req, res) {
    res.set('authentication', 'abcdefg')
    res.send({ status: 1 })
})

app.post('/api/oauth/test', function (req, res) {
    var auth = req.get('authentication')

    if (auth)
        res.send({ status: 1, auth: auth })
    else
        res.send({ status: 0, msg: 'oauth is not found' })
})

function listen(path, port) {
    if (isStart) return
    isStart = true

    if (typeof path === 'number') {
        port = path
        path = __dirname
    }

    path = path || __dirname
    port = port || 5000

    app.use(express.static(path));  
    var server = app.listen(port, function () {
        console.log('Listening on port %d', server.address().port)
    });
}

module.exports = {
    listen: listen
}
