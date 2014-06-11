var gulp      = require('gulp'),
    component = require('gulp-component'),
    uglify    = require('gulp-uglify'),
    rename    = require('gulp-rename'),
    less      = require('gulp-less'),
    jshint    = require('gulp-jshint'),
    minifyCSS = require('gulp-minify-css')

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
    return gulp.src('src/**/*.js')
    .pipe(jshint())
    .pipe(jshint.reporter('default'));
});
