describe('vui.utils', function(){
    var utils = vui.require("utils"),
        _     = vui.underscore
  
    it('urlResolve', function () {
        var origin = 'http://example.com/path/index.html:3/4/5?a=1&b=2#abc',
            url = utils.urlResolve(origin)

        url.href.should.eql(origin)
        url.pathname.should.eql('/path/index.html:3/4/5')
        url.host.should.eql('example.com')
        url.protocol.should.eql('http')
        url.search.should.eql('a=1&b=2')
        url.hash.should.eql('abc')
        url.colon.should.eql(['3','4','5'])
        //expect(utils.equals({a:"3",b:"4"}, url.colon)).to.be.true
    })

    it('element class', function () {
        var el  = document.createElement('div'),
            cls = 'active'

        function _testTrue() {
            utils.hasClass(el, cls).should.be.true
            el.className.should.contain(cls)
        }

        function _testFalse() {
            utils.hasClass(el, cls).should.not.be.true
            el.className.should.not.contain(cls)
        }

        el.className = 'test'
        _testFalse()
        utils.addClass(el, cls)
        _testTrue()
        utils.removeClass(el, cls)
        _testFalse()
        utils.toggleClass(el, cls)
        _testTrue()
        utils.toggleClass(el, cls)
        _testFalse()
    })

    it('element isDescendant', function () {
        var parent  = document.createElement('div'),
            child = document.createElement('div')

        utils.isDescendant(parent, child).should.be.false

        parent.appendChild(child) 
        utils.isDescendant(parent, child).should.be.true
    })

    it('url set & get', function(){
        utils.setMode('html5')
        utils.url('index.html')
        utils.url().should.contain('index.html')
        utils.url().should.not.contain('#!/')

        utils.setMode('')
        var foo = utils.url()
        foo.should.contain('/test')
        utils.url('test.html')
        utils.url().should.contain('#!/test.html')
    })

    /*
    it('node', function () {
        var node = utils.node(true)
        node.pathname.should.eql('/test/test.html')         
        node = utils.node()
        node.pathname.should.eql('/test/index.html')         
    })
    */

    it('search', function () {
        var foo

        function _test() {
            // clear path first
            utils.url('index.html')
            utils.search({a:1,b:2,c:'ab&d'})
            foo = utils.search()
            foo.a.should.eql('1')
            foo.b.should.eql('2')
            foo.c.should.eql('ab&d')

            utils.search('c', 3)
            foo = utils.search()
            foo.c.should.eql('3')
            foo.a.should.eql('1')

            utils.search({b: 4})
            foo = utils.search()
            foo.b.should.eql('4')
            _.has(foo, 'a').should.be.false
        }

        utils.setMode('html5')
        _test()
        utils.setMode('')
        _test()
    })

    it('hash', function () {
        function _test() {
            utils.url('index.html')
            utils.hash('abcdefg')
            utils.hash().should.eql('abcdefg')   
        }

        utils.setMode('html5')
        _test()
        utils.setMode('')
        _test()
        
    })

    
    it('parseKeyValue & toKeyValue', function () {
        var s = 'a=1&b=2&c=3',
            j = utils.parseKeyValue(s),
            sj = utils.toKeyValue(j)

        j.a.should.eql('1')
        j.b.should.eql('2')
        j.c.should.eql('3')
        sj.should.eql(s)
    })

})
