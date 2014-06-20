describe('vui.utils', function(){
    var utils = vui.require("utils")
    it('copy', function () {
        function _test(a) {
            var b = utils.copy(a)
            a.should.eql(b)
            b[0] = 3
            a.should.not.eql(b)

            utils.copy(b, a)
            a.should.eql(b)
            a[0].should.eql(3)

            b[0] = 1
            a.should.not.eql(b)
        }

        _test({ a:1, b:2, e:{ d:'999' } })
        _test([1,2,3,4,5,6,7,8])
        _test([1,2,3,4,5,{a:1},7,8])

        a = alert
        b = utils.copy(alert)
        expect(a).eql(b)

        function Animal() {}
        Animal.prototype.foo = 'bar'
        function Dog() {
            Animal.call(this)
        }
        Dog.prototype = new Animal()
        Dog.prototype.constructor = Dog
        Dog.prototype.bar = 'baz'
        var dog1 = new Dog(),
            dog2 = utils.copy(dog1)

        dog1.should.eql(dog2)
        expect(dog1 instanceof Dog).equal(true)
        expect(dog2 instanceof Dog).equal(false) 
        expect(dog1 instanceof Animal).equal(true)
        expect(dog2 instanceof Animal).equal(false)
    })

    it('shallowCopy', function () {
        var a = { a:1, b:2, e:{ d:'999' } }
        var b = utils.shallowCopy(a)
        a.should.eql(b)
        b.a = 3
        a.should.not.eql(b)

        utils.shallowCopy(b, a)
        a.should.eql(b)
        a.a.should.eql(3)

        b.a = 1
        a.should.not.eql(b)
    })

    it('equals', function () {
        var a = { a:1, b:2, e:{ d:'999' } },
            b = utils.copy(a)
        
        expect(utils.equals(a,b)).eql(true)
        a.b = 3
        expect(utils.equals(a,b)).eql(false)

        a = alert
        b = utils.copy(alert)

        expect(utils.equals(a,b)).eql(true)
    })

    it('toJson & fromJson', function () {
        var a = { a:1, b:2, e:{ d:'999' } },
            b = '{"a":1,"b":2,"e":{"d":"999"}}',
            c = utils.fromJson(b)

        utils.toJson(a).should.equal(b)
        a.should.eql(c)
        a.b.should.eql(2)
    })

    it('toBoolean', function () {
        function _test(val, b) {
            b = !!b
            expect(utils.toBoolean(val)).eql(b)
        }

        _test(1, true)
        _test(alert, true)
        _test('f', false)
        _test('false', false)
        _test([], false)
        _test([1], true)
        _test('[]', false)
        _test(undefined, false)
        _test(null, false)
        _test('no', false)
        _test('on', true)
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

    it('urlResolve', function () {
        var origin = 'http://example.com/path/index.html?a=1&b=2#abc',
            url = utils.urlResolve(origin)

        url.href.should.eql(origin)
        url.pathname.should.eql('/path/index.html')
        url.host.should.eql('example.com')
        url.protocol.should.eql('http')
        url.search.should.eql('a=1&b=2')
        url.hash.should.eql('abc')
    })

    it('hashCode', function () {
        var hash = utils.hashCode(alert)
        hash.should.equal(utils.hashCode(alert))

        hash = utils.hashCode('alert')
        hash.should.equal(92899676)

        hash = utils.hashCode(123456)
        hash.should.equal(1450575459)
    })

    it('judge', function () {
        var el  = document.createElement('div')
        function _test(fn, t) {
            if (typeof t == 'string') t = [t]
            expect(fn('')).eql(utils.contains(t,'string'))
            expect(fn(1)).eql(utils.contains(t,'int'))
            expect(fn(alert)).eql(utils.contains(t,'function'))
            expect(fn([])).eql(utils.contains(t,'array'))
            expect(fn({})).eql(utils.contains(t,'object'))
            expect(fn(new Date())).eql(utils.contains(t,'date'))
            expect(fn(c=undefined)).eql(utils.contains(t,'undefined'))
            expect(fn(el)).eql(utils.contains(t, 'element'))
        }

        _test(utils.isString, 'string')
        _test(utils.isFunction, 'function')
        _test(utils.isObject, ['array', 'object', 'date', 'element'])
        _test(utils.isDefined, ['string', 'int', 'function', 'array', 'object', 'date', 'element'])
        _test(utils.isUndefined, 'undefined')
        _test(utils.isDate, 'date')
        _test(utils.isElement, 'element')
    })

    it('forEach', function () {
        var forEach = utils.forEach,
            arr = [1,2,3,4,5,6,7],
            obj = {a:1,b:2,c:3,d:4},
            count = 0

        forEach(arr, function (i) {
            count += i
        })

        count.should.eql(28)

        count = 0
        arr = []
        forEach(obj, function (i, k) {
            count += i
            arr.push(k)
        })

        count.should.eql(10)
        arr.should.eql(['a','b','c','d'])
    })

    it('arrayRemove', function () {
        var arr = [1,2,3,4,5,6,7,8],
            val = null
        val = utils.arrayRemove(arr, 2)
        arr.should.eql([1,3,4,5,6,7,8])
        val.should.eql(2)

        val = utils.arrayRemove(arr, 9)
        arr.should.eql([1,3,4,5,6,7,8])
        val.should.eql(9)
    })

    it('size', function () {
        var arr = [1,2,3,4,5,6,7],
            obj = {a:1,b:2,c:3,d:4}

        utils.size(arr).should.eql(7)
        utils.size(obj).should.eql(4)
    })

    it('nextUid', function () {
        var uid
        for(var i=0;i<100;i++) 
            uid = utils.nextUid()

        uid.should.eql('A02S')
    })

    ////////////////////////////////////////////////////////////////////
    // ./node

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
