var gulp            = require('gulp'),
    component       = require('gulp-component'),
    uglify          = require('gulp-uglify'),
    rename          = require('gulp-rename'),
    less            = require('gulp-less'),
    jshint          = require('gulp-jshint'),
    util            = require('gulp-util'),
    mocha           = require('gulp-mocha'),
    minifyCSS       = require('gulp-minify-css'),
    mochaPhantomJS  = require('gulp-mocha-phantomjs')

var paths = {
  scripts: ['src/**/*.js', 'test/**/*.js'],
  tests: 'test/**/*.js'
}

gulp.task('default', function () {
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
    gulp.watch(['component.json', 'src/**/*'], ['default'])
    gulp.watch(['docs/css/**/*.less'], ['less'])
})

gulp.task('lint',function() {
    return gulp.src(paths.scripts)
        .pipe(jshint())
        .pipe(jshint.reporter('default'));
});

gulp.task('test',function() {
    return gulp
        .src("test/index.html")
        .pipe(mochaPhantomJS({reporter: 'spec'}))
});
