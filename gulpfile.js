var gulp = require('gulp');
var doc = require('gulp-lazy-doc');

gulp.task('default', function () {
    gulp.src(['_readme.md'])
        .pipe(doc({
            output: 'readme.md',
            scopes: [{start: '/**@', end: '*/'}, {start: '<!--', end: '-->'}, {start: '//[', end: '//]'}]
        }))
        .pipe(gulp.dest('./'));
});