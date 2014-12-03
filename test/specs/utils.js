describe('vui.utils', function(){
    var utils = vui.require("utils")
  
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
})
