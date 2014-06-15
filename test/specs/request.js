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

    it('oauth', function (done) {
        function s1() {
            request.get('/api/oauth/test')
                .end(function (res) {
                    res.header.authentication.should.eql('abcdefg')
                    res.body.status.should.eql(1)
                    s2()
                })
        }

        function s2() {
            request.post('/api/oauth/test')
                .end(function (res) {
                    res.body.status.should.eql(1)
                    done()
                })
        }

        s1()
    })
})
