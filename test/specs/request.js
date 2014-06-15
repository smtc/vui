describe('vui.request', function () {
    this.timeout(5000)
    var request = vui.require('request')

    it('get', function (done) {
        //console.log(vui.utils.urlResolve('json/request.json').href)
        request.get('json/request.json')
            .end(function (res) {
                res.ok.should.be.true
                res.body.status.should.eql(1)
                done()
            })
    })
})
