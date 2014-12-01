module.exports = function (grunt) {

    grunt.initConfig({
        jshint: {
            options: {
                jshintrc: true
            },
            build: {
                src: ['gruntfile.js', 'tasks/*.js']
            },
            src: {
                src: 'src/**/*.js'
            },
            test: {
                src: ['test/unit/specs/**/*.js', 'test/e2e/*.js']
            }
        },

        duojs: {
            options: {
                entry: './src/main.js',
                standalone: 'vui',
                global: 'vui'
            }
        }
    })


    // load npm tasks
    grunt.loadNpmTasks('grunt-contrib-jshint')

    // load custom tasks
    grunt.loadTasks('tasks')

    grunt.registerTask('build', ['jshint', 'duojs']);
}
