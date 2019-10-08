var gulp = require('gulp');
var svgSprite = require('gulp-svg-sprite');
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

var svgConfig = {
	mode: {
		symbol: {
			dest: './m/i/',
			sprite: 'icons.svg'
		}
	},
	svg: {
		xmlDeclaration: false,
		doctypeDeclaration: false
	}
};

log.info('Production mode: ', settings.build.prod);


// Processing and utility tasks

gulp.task('svgsprite', function() {
	return gulp.src('./m/i/_svg/**/*.svg')
	.pipe(svgSprite(svgConfig))
	.pipe(gulp.dest('.'))
});


gulp.task('webfonts', function() {
	return gulp.src([
		
	])
	.pipe(gulp.dest('./m/f/'));
});
gulp.task('html', function () {
	return gulp.src('./m/_templates/*.html')
		.pipe(nunjucks({
			searchPaths: ['./m/_templates'],
			locals: {
				'build_version': settings.build.version
			},
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
gulp.task('js.pre', function () {
	return gulp.src([
		'./node_modules/jquery/dist/jquery.min.js',
		'./node_modules/bootstrap/dist/js/bootstrap.min.js',
		'./node_modules/jquery.equal-heights/src/jquery.equal-heights.js',
		'./node_modules/underscore/underscore-min.js',
		'./node_modules/svg4everybody/dist/svg4everybody.min.js',
		'./node_modules/slick-carousel/slick/slick.min.js',
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
gulp.task('styles', /*gulp.series('sprite',*/ function () {
	return gulp.src([
		'./node_modules/slick-carousel/slick/slick.scss',
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
gulp.task('js', gulp.series('js.pre', 'js.post', function (done) { done(); }));
gulp.task('process', gulp.series(/*'webfonts', */'svgsprite', 'styles', 'html', 'js', function (done) { done(); }));
gulp.task('default', gulp.series('process', function (done) {
	gulp.watch('./m/_scss/**/*', gulp.series('styles'));
	gulp.watch('./m/_templates/**/*', gulp.series('html'));
	gulp.watch('./m/js/app/**/*', gulp.series('js'));
	done();
}));
gulp.task('util.enable-production-mode', function () {
	settings.build.prod = true;	
	log.info('Production mode has been set to: ', settings.build.prod);
});

// Development tasks
gulp.task('webserver', gulp.series('default', function (done) {
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
		done();
}));

// Visual studio publishing pre-build tasks
gulp.task('prod.publish', gulp.series('util.enable-production-mode', 'process', function (done) { done(); }));
