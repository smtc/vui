'use strict'

var Duo = require('duo')

module.exports = function(grunt) {

    grunt.registerTask('duojs', function() {
        var options = this.options(),
            done = this.async()

        var duo = new Duo(process.cwd())
            .entry(options.entry || '')
            .standalone(options.standalone)
            .global(options.global)

        duo.write(function (err) {
            if (err) {
                grunt.log.error('duojs compiler error ' + err)
                grunt.fail.warn('Duojs failed to compile.')
                return done(err)
            }
            done()
        })

    })

}
