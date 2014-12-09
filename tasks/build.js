'use strict'

var Duo = require('duo'),
    fs  = require('fs')

module.exports = function(grunt) {

    grunt.registerTask('duojs', function() {
        var options = this.options({
                buildTo: './build'
            }),
            done = this.async()

        var duo = new Duo(process.cwd())
            .entry(options.entry || '')
            .buildTo(options.buildTo)
            .standalone(options.standalone)
            .global(options.global)

        duo.write(function (err) {
            if (err) {
                grunt.log.error('duojs compiler error ' + err)
                grunt.fail.warn('Duojs failed to compile.')
                return done(err)
            }

            if (options.dist) {
                var src = options.buildTo + '/' + options.entry
                fs.rename(src, options.dist, function (err) {
                    if (err) throw err
                })
            }

            done()
        })

    })

}
