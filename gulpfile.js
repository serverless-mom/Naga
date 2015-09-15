
var gulp = require('gulp'),
 shell = require('gulp-shell')

gulp.task('code', shell.task([
  'clear','node index.js'
]))

gulp.task('watch', function() {
  // Watch .js files
  gulp.watch('*.js', ['code']);

});
