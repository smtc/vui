
describe('vui.location', function(){
    var _location = vui.require('location'),
        utils = vui.require('utils'),
        url = _location.url,
        foo
    it('url set & get', function(){
        _location.setMode('html5').url('index.html')
        url().should.contain('index.html')
        url().should.not.contain('#!/')

        _location.setMode('')
        foo = url()
        foo.should.contain('/test')
        url('test.html')
        url().should.contain('#!/test.html')
    })

    it('node', function () {
        var node = _location.node(true)
        node.pathname.should.eql('/test/test.html')         
        node = _location.node()
        node.pathname.should.eql('/test/index.html')         
    })

    it('search', function () {
        var foo

        function _test() {
            // clear path first
            url('index.html')
            _location.search({a:1,b:2,c:'ab&d'})
            foo = _location.search()
            foo.a.should.eql('1')
            foo.b.should.eql('2')
            foo.c.should.eql('ab&d')

            _location.search('c', 3)
            foo = _location.search()
            foo.c.should.eql('3')
            foo.a.should.eql('1')

            _location.search({b: 4})
            foo = _location.search()
            foo.b.should.eql('4')
            utils.contains(foo, 'a').should.be.false
        }

        _location.setMode('html5')
        _test()
        _location.setMode('')
        _test()
    })

    it('hash', function () {
        function _test() {
            url('index.html')
            _location.hash('abcdefg')
            _location.hash().should.eql('abcdefg')   
        }

        _location.setMode('html5')
        _test()
        _location.setMode('')
        _test()
        
    })

})
