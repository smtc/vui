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
            }
        },

        duojs: {
            options: {
                entry: 'src/main.js',
                standalone: 'vui',
                global: 'vui',
                dist: 'dist/vui.js'
            }
        },

        uglify: {
            options: {
                banner: '/* vui.js <%= grunt.template.today("yyyy-mm-dd") %> */\n'
            },
            dist: {
                src: 'dist/vui.js',
                dest: 'dist/vui.min.js'
            }
        }
    })


    // load npm tasks
    grunt.loadNpmTasks('grunt-contrib-jshint')
    grunt.loadNpmTasks('grunt-contrib-uglify')

    // load custom tasks
    grunt.loadTasks('tasks')

    grunt.registerTask('build', ['jshint', 'duojs', 'uglify']);
}
