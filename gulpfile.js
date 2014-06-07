var gulp      = require('gulp'),
    component = require('gulp-component'),
    uglify    = require('gulp-uglify')
    rename    = require('gulp-rename')

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

gulp.task('watch', function () {
    gulp.watch(['component.json', 'src/**/*'], ['default'])
})

