var _location = vui.require('location')

describe('vui.location', function(){
    it('url test', function(){
        _location.url().should.contain('/test')
    })
})
