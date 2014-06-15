var gulp            = require('gulp'),
    component       = require('gulp-component'),
    uglify          = require('gulp-uglify'),
    rename          = require('gulp-rename'),
    less            = require('gulp-less'),
    jshint          = require('gulp-jshint'),
    util            = require('gulp-util'),
    mocha           = require('gulp-mocha'),
    minifyCSS       = require('gulp-minify-css'),
    shell           = require('gulp-shell'),
    mochaPhantomJS  = require('gulp-mocha-phantomjs')

var paths = {
  scripts: ['src/**/*.js'],
  tests: 'test/**/*.js'
}

gulp.task('default', function () {
})

gulp.task('build', function () {
    gulp.src('component.json')
        .pipe(component({
            standalone: true
        }))
        //.pipe(gulp.dest('./dist'))
        .pipe(rename('vui.js'))
        .pipe(gulp.dest('./'))
        .pipe(rename('vui.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest('./'))
})

gulp.task('less', function () {
    gulp.src('docs/css/style.less')
        .pipe(less())
        .pipe(gulp.dest('docs/css/'))
        .pipe(minifyCSS({keepBreaks:true}))
        .pipe(gulp.dest('docs/css/'))
})

gulp.task('watch', function () {
    gulp.watch(['component.json', 'src/**/*'], ['build', 'test'])
    gulp.watch(['docs/css/**/*.less'], ['less'])
    gulp.watch(['test/**/*.*'], ['test'])
})

gulp.task('lint',function() {
    return gulp.src(paths.scripts)
        .pipe(jshint())
        .pipe(jshint.reporter('default'));
})

/*
gulp.task('test', function() {
    return gulp.src('test/index.html')
        .pipe(mochaPhantomJS())
})
*/
gulp.task('test', shell.task([
   'mocha-phantomjs -s localToRemoteUrlAccessEnabled=true -s webSecurityEnabled=false http://localhost/test/index.html'             
]))

gulp.task('autotest', function () {
    gulp.watch(['test/**/*.*'], ['test'])
})

