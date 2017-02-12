var gulp = require('gulp');
var sass = require('gulp-sass');
var nunjucks = require('gulp-nunjucks-html');
var spritesmith = require('gulp.spritesmith');
var merge = require('merge-stream');
var sourcemaps = require('gulp-sourcemaps');
var cleanCSS = require('gulp-clean-css');
var concat = require('gulp-concat');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');
var webserver = require('gulp-webserver');


gulp.task('styles', ['sprite'], function() {
    gulp.src('./m/_scss/**/*.scss')
        .pipe(sass().on('error', sass.logError))
		.pipe(sourcemaps.init())
		.pipe(cleanCSS())
		.pipe(sourcemaps.write())
        .pipe(gulp.dest('./m/css'));
});

gulp.task('html', function() {
    gulp.src('./m/_templates/*.html')
        .pipe(nunjucks({
            searchPaths: ['./m/_templates'],
            tags: {
				blockStart: '<%',
				blockEnd: '%>',
				variableStart: '<$',
				variableEnd: '$>',
				commentStart: '<#',
				commentEnd: '#>'
			}
        }))
        .pipe(gulp.dest('./'));
});

 gulp.task('js-pre', function() {
    gulp.src([
			'./m/_vendor/jquery/dist/jquery.min.js',
			'./m/_vendor/bootstrap-sass/assets/javascripts/bootstrap.min.js',
			'./m/_vendor/helix.jquery-equalheights/src/jquery.equalheights.js',
			'./m/_vendor/underscore/underscore-min.js',
			'./m/js/app/pre/**/*.js'
			])
	    .pipe(sourcemaps.init())
		.pipe(concat('pre.min.js'))
		.pipe(uglify())
		.pipe(sourcemaps.write('./'))
        .pipe(gulp.dest('./m/js/'));
});

gulp.task('js-post', function() {
    gulp.src([
			'./m/js/app/post/**/*.js',
			])
	    .pipe(sourcemaps.init())
		.pipe(concat('post.min.js'))
		.pipe(uglify())
		.pipe(sourcemaps.write('./'))
        .pipe(gulp.dest('./m/js/'));
});

gulp.task('js', ['js-pre', 'js-post'], function() {
	
});

gulp.task('sprite', function() {
    var spriteData = gulp.src('./m/i/_spritesource/**/*.png')
        .pipe(spritesmith({
			padding: 5,
            imgName: 'sprite.png',
            imgPath: '../i/sprite.png',
            cssName: '_sprites.scss',
			retinaSrcFilter: ['./m/i/_spritesource/**/*@2x.png'],
			retinaImgName: 'sprite@2x.png',
			retinaImgPath: '../i/sprite@2x.png',
        }));

    var imgStream = spriteData.img
        .pipe(gulp.dest('./m/i/'));

    var cssStream = spriteData.css
        .pipe(gulp.dest('./m/_scss/'));

    return merge(imgStream, cssStream);
});

gulp.task('webserver', ['default'], function(){
  gulp.src('./')
    .pipe(webserver({
		livereload: {
			enable: true,
			filter: function(fileName) {
				if (fileName.match(/.map$/)) {
					return false;
				} else {
					return true;
				}
			}
		},
		directoryListing: true,
		open: true
    }));     
});

gulp.task('default', ['styles', 'html', 'js'], function() {
    gulp.watch('./m/_scss/**/*', ['styles']);
    gulp.watch('./m/_templates/**/*', ['html']);
    gulp.watch('./m/i/_spritesource/**/*', ['sprite']);
	gulp.watch('./m/_vendor/**/*', ['js']);
	gulp.watch('./m/js/app/**/*', ['js']);
});
