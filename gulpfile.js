var gulp = require('gulp');
var sass = require('gulp-sass');
var nunjucks = require('gulp-nunjucks-html');
var spritesmith = require('gulp.spritesmith');
var merge = require('merge-stream');
var sourcemaps = require('gulp-sourcemaps');
var cleanCSS = require('gulp-clean-css');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var webserver = require('gulp-webserver');
var argv = require('yargs').argv;
var gulpif = require('gulp-if');
var urlAdjuster = require('gulp-css-url-adjuster');
var log = require('fancy-log');

var settings = {
	build: {
		prod: !!(argv.production || argv.prod),
		version: parseInt(Math.random() * 10000000) + "-" + parseInt(Math.random() * 10000000)
	}
}

log.info('Production mode: ', settings.build.prod);


// Processing and utility tasks
gulp.task('styles', ['sprite'], function () {
	return gulp.src([
		'./m/_scss/**/*.scss'
	])
		.pipe(sass().on('error', sass.logError))
		.pipe(concat('site.min.css'))
		.pipe(urlAdjuster({
			prepend: '',
		    append: '',
		    replace:  ['../fonts/','../f/'],
		}))
		.pipe(gulpif(!settings.build.prod, sourcemaps.init()))
		.pipe(cleanCSS())
		.pipe(gulpif(!settings.build.prod, sourcemaps.write()))
		.pipe(gulp.dest('./m/css'));
});
gulp.task('html', function () {
	return gulp.src('./m/_templates/*.html')
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
gulp.task('webfonts', function() {
	return gulp.src([
	])
	.pipe(gulp.dest('./m/f/'));
});
gulp.task('js.pre', function () {
	return gulp.src([
		'./node_modules/jquery/dist/jquery.min.js',
		'./node_modules/bootstrap-sass/assets/javascripts/bootstrap.min.js',
		'./node_modules/jquery.equal-heights/src/jquery.equal-heights.js',
		'./node_modules/underscore/underscore-min.js',
		'./m/js/app/pre/**/*.js'
	])
		.pipe(gulpif(!settings.build.prod, sourcemaps.init()))
		.pipe(concat('pre.min.js'))
		.pipe(gulpif(settings.build.prod, uglify()))
		.pipe(gulpif(!settings.build.prod, sourcemaps.write('./')))
		.pipe(gulp.dest('./m/js/'));
});
gulp.task('js.post', function () {
	return gulp.src([
		'./m/js/app/post/**/*.js',
	])
		.pipe(gulpif(!settings.build.prod, sourcemaps.init()))
		.pipe(concat('post.min.js'))
		.pipe(gulpif(settings.build.prod, uglify()))
		.pipe(gulpif(!settings.build.prod, sourcemaps.write('./')))
		.pipe(gulp.dest('./m/js/'));
});
gulp.task('js', ['js.pre', 'js.post'], function () { });
gulp.task('sprite', function () {
	var spriteData = gulp.src('./m/i/_spritesource/**/*.png')
		.pipe(spritesmith({
			padding: 15,
			imgName: 'sprite.png',
			imgPath: '../i/sprite.png?' + settings.build.version,
			cssName: '_sprites.scss',
			retinaSrcFilter: ['./m/i/_spritesource/**/*@2x.png'],
			retinaImgName: 'sprite@2x.png',
			retinaImgPath: '../i/sprite@2x.png?' + settings.build.version,
		}));

	var imgStream = spriteData.img
		.pipe(gulp.dest('./m/i/'));

	var cssStream = spriteData.css
		.pipe(gulp.dest('./m/_scss/'));

	return merge(imgStream, cssStream);
});
gulp.task('process', ['webfonts', 'styles', 'html', 'js'], function () { });
gulp.task('default', ['process'], function () {
	gulp.watch('./m/_scss/**/*', ['styles']);
	gulp.watch('./m/_templates/**/*', ['html']);
	gulp.watch('./m/i/_spritesource/**/*', ['sprite']);
	gulp.watch('./m/js/app/**/*', ['js']);
});
gulp.task('util.enable-production-mode', function () {
	settings.build.prod = true;	
	log.info('Production mode has been set to: ', settings.build.prod);
});

// Development tasks
gulp.task('webserver', ['default'], function () {
	gulp.src('./')
		.pipe(webserver({
			livereload: {
				enable: true,
				filter: function (fileName) {
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

// Visual studio publishing pre-build tasks
gulp.task('prod.publish', ['util.enable-production-mode', 'process'], function () { });