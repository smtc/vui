
describe('vui.location', function(){
    var _location = vui.require('location'),
        foo
    it('url test', function(){
        foo = _location.url()
        foo.should.contain('/test')
        _location.url('test.html')
        foo = _location.url()
        console.log(foo)
        foo.should.contain('#!/test.html')
    })
})
