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
        },

        watch: {
            scripts: {
                files: ['src/**/*.js'],
                tasks: ['build'],
                options: {
                }
            }
        },

        // Mocha
        mocha: {
            all: {
                src: ['test/index.html'],
            },
            options: {
                run: true
            }
        }
    })


    // load npm tasks
    grunt.loadNpmTasks('grunt-contrib-jshint')
    grunt.loadNpmTasks('grunt-contrib-uglify')
    grunt.loadNpmTasks('grunt-contrib-watch')
    grunt.loadNpmTasks('grunt-mocha')

    // load custom tasks
    grunt.loadTasks('tasks')

    //grunt.registerTask('build', ['jshint', 'duojs', 'uglify'])
    grunt.registerTask('build', ['duojs', 'uglify'])
    grunt.registerTask('test', ['mocha'])
}
