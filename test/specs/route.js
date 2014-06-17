describe('vui.route', function () {
    this.timeout(5000)
    var route = vui.require('route'),
        location = vui.location,
        count = 0

    function add() { 
        count += 1
    }

    it('bind & unbind', function (done) {
        route.bind(add)
        location.url('index.html?a=1')

        setTimeout(function () {
            count.should.eql(1)

            route.unbind(add)
            setTimeout(function () {
                location.url('index.html?a=2')
                location.url('index.html?a=3')
                count.should.eql(1)
                done()
            }, 100)

        }, 100)
    })

    it('route v-view', function (done) {
        route.unbind()
        setTimeout(function () {
            route(function (path) {
                vui.$data.view = path
            })
            location.url('route.html')
            setTimeout(function () {
                document.querySelector('#route').innerHTML.should.eql('1234')
                done()

                route.unbind()
            }, 200)

        }, 200)
    })
})
