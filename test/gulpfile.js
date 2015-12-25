var gulp = require('gulp');
var doc = require('gulp-lazy-doc');


var config = {
    src: './src/',
    dest: './doc/'
};
gulp.task('default', function () {
    gulp.src([config.src + '*.*'])
        .pipe(doc({output: 'readme.md', scopes: [{start: '/**@', end: '*/'}, {start: '<!--', end: '-->'}]}))
        .pipe(gulp.dest(config.dest));
});