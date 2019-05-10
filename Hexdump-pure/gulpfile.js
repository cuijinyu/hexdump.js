let gulp = require("gulp");
let concat = require('gulp-concat'); 
let rename = require('gulp-rename'); 
let uglify = require('gulp-uglify'); 

gulp.task('minify', function() {
    return gulp.src(['./hexdump.prod.js'])
                .pipe(rename("hexdump.min.js"))
                .pipe(uglify())
                .pipe(gulp.dest(["./dest"]))
})