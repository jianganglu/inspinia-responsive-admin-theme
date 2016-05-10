/**
 * Gulpfile setup
 */

// Project configuration
var project      = 'front-end-automation-framework', // Project name, used for build zip.
    url          = 'http://localhost:8080/front-end-automation-framework', // Local Development URL for BrowserSync. Change as-needed.
    bower        = './assets/bower_components/'; // Not truly using this yet, more or less playing right now. TO-DO Place in Dev branch
    build        = './front-end-automation-framework/', // Files that you want to package into a zip go here
    customJs = [];

var basePaths = {
  src: 'src/assets/',
  dst: 'dist/assets/',
  bower: 'src/bower_components'
};
var paths = {
  html: {
    src: './src/**/*.html',
    dst: './dist/'
  },
  img: {
    src: [basePaths.src + 'img/**/*.{png,jpg,gif}'],
    dst: basePaths.dst + 'img/'
  },
  css: {
    vendorSrc : [
      basePaths.src + 'vendor/**/*.css',
      '!' + basePaths.src + 'vendor/**/*.min.css'
    ],
    vendorDst: basePaths.dst + 'css/',
    src: basePaths.src + 'scss/themes/*.scss',
    dst: basePaths.dst + 'css'
  },
  js: {
    src: basePaths.src + 'js/*.js',
    dst: basePaths.dst + 'js'
  },
  fonts: {
    src: basePaths.src + 'fonts/**/*',
    dst: basePaths.dst + 'fonts'
  }
};

// Load plugins
var gulp         = require('gulp'),
    browserSync  = require('browser-sync'), // Asynchronous browser loading on .scss file changes
    reload       = browserSync.reload,
    autoprefixer = require('gulp-autoprefixer'), // Autoprefixing magic
    minifycss    = require('gulp-uglifycss'),
    filter       = require('gulp-filter'),
    uglify       = require('gulp-uglify'),
    glob         = require('glob'),
    amdOptimize  = require('amd-optimize'),
    gulpMerge    = require('gulp-merge'),
    imagemin     = require('gulp-imagemin'),
    spritesmith  = require('gulp.spritesmith'),
    buffer       = require('vinyl-buffer'),
    csso         = require('gulp-csso'),
    imagemin     = require('gulp-imagemin'),
    merge        = require('merge-stream'),
    newer        = require('gulp-newer'),
    rename       = require('gulp-rename'),
    concat       = require('gulp-concat'),
    notify       = require('gulp-notify'),
    cmq          = require('gulp-combine-media-queries'),
    runSequence  = require('gulp-run-sequence'),
    sass         = require('gulp-sass'),
    plugins      = require('gulp-load-plugins')({ camelize: true }),
    ignore       = require('gulp-ignore'), // Helps with ignoring files and directories in our run tasks
    rimraf       = require('gulp-rimraf'), // Helps with removing files and directories in our run tasks
    zip          = require('gulp-zip'), // Using to zip up our packaged theme into a tasty zip file that can be installed in WordPress!
    plumber      = require('gulp-plumber'), // Helps prevent stream crashing on errors
    cache        = require('gulp-cache'),
    sourcemaps   = require('gulp-sourcemaps'),
    gutil        = require('gulp-util');

// Allows gulp --dev to be run for a more verbose output
var isProduction = false;

if(gutil.env.type === 'prod') {
  isProduction = true;
}

/**
 * Browser Sync
 *
 * Asynchronous browser syncing of assets across multiple devices!! Watches for changes to js, image and php files
 * Although, I think this is redundant, since we have a watch task that does this already.
 */
gulp.task('browser-sync', function() {
  var files = [
    // '**/*.php',
    // '**/*.html',
    '**/*.{png,jpg,gif}'
  ];
  browserSync.init(files, {
    server: {
      baseDir: './dist'
    },
    // Read here http://www.browsersync.io/docs/options/
    // proxy: url,
    // port: 8080,
    // Tunnel the Browsersync server through a random Public URL
    // tunnel: true,

    // Attempt to use the URL "http://my-private-site.localtunnel.me"
    // tunnel: "ppress",

    // Inject CSS changes
    injectChanges: true

  });
});

/**
 * Clean dist file
 */
gulp.task('clean', function(cb) {
  return gulp.src(['./dist/', './*.zip'])
    .pipe(rimraf());
});

/**
 * Html
 */
gulp.task('html', function() {
  gulp.src(paths.html.src)
    .pipe(gulp.dest(paths.html.dst));
});

// Copy everything under `src/languages` indiscriminately
gulp.task('fonts', function() {
  return gulp.src(paths.fonts.src)
  .pipe(gulp.dest(paths.fonts.dst));
});

/**
 * Styles: Vendor
 */
gulp.task('vendorStyles', function() {
  gulp.src(paths.css.vendorSrc)
    .pipe(plumber({
      errorHandler: function (error) {
        console.log(error.message);
        this.emit('end');
    }}))
    .pipe(isProduction ? gutil.noop() : sourcemaps.init())
    .pipe(concat('libs.css'))
    .pipe(isProduction ? gutil.noop() : sourcemaps.write({includeContent: false}))
    .pipe(isProduction ? gutil.noop() : sourcemaps.init({loadMaps: true}))
    .pipe(autoprefixer('last 2 version', '> 1%', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4'))
    .pipe(isProduction ? gutil.noop() : sourcemaps.write('./'))
    .pipe(plumber.stop())
    .pipe(gulp.dest(paths.css.vendorDst))
    .pipe(isProduction ? cmq({
      log: true
    }) : gutil.noop()) // Combines Media Queries
    .pipe(reload({stream:true})) // Inject Styles when style file is created
    // .pipe(isProduction ? rename({ suffix: '.min' }) : gutil.noop())
    .pipe(isProduction ? minifycss({
      maxLineLen: 80
    }) : gutil.noop())
    .pipe(gulp.dest(paths.css.vendorDst))
    .pipe(reload({stream:true})) // Inject Styles when min style file is created
    .pipe(notify({ message: 'Styles task complete', onLast: true }));
});

/**
 * Styles: Custom
 *
 * Looking at src/sass and compiling the files into Expanded format, Autoprefixing and sending the files to the build folder
 *
 * Sass output styles: https://web-design-weekly.com/2014/06/15/different-sass-output-styles/
*/
gulp.task('styles', function() {
  gulp.src(paths.css.src)
    .pipe(plumber({
      errorHandler: function (error) {
        console.log(error.message);
        this.emit('end');
    }}))
    .pipe(isProduction ? gutil.noop() : sourcemaps.init())
    .pipe(sass({
      errLogToConsole: true,
      // outputStyle: 'compressed',
      outputStyle: 'compact',
      // outputStyle: 'nested',
      // outputStyle: 'expanded',
      precision: 10
    }))
    .pipe(isProduction ? gutil.noop() : sourcemaps.write({includeContent: false}))
    .pipe(isProduction ? gutil.noop() : sourcemaps.init({loadMaps: true}))
    // .pipe(autoprefixer('last 2 version', '> 1%', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4'))
    .pipe(isProduction ? gutil.noop() : sourcemaps.write('.'))
    .pipe(plumber.stop())
    .pipe(gulp.dest(paths.css.dst))
    .pipe(filter('**/*.css')) // Filtering stream to only css files
    .pipe(isProduction ? cmq({
      log: true
    }) : gutil.noop()) // Combines Media Queries
    .pipe(reload({stream:true})) // Inject Styles when style file is created
    // .pipe(isProduction ? rename({ suffix: '.min' }) : gutil.noop())
    .pipe(isProduction ? minifycss({
      maxLineLen: 80
    }) : gutil.noop())
    .pipe(gulp.dest(paths.css.dst))
    .pipe(reload({stream:true})) // Inject Styles when min style file is created
    .pipe(notify({ message: 'Styles task complete', onLast: true }));
});

/**
 * Scripts: Custom
 *
 * Look at src/js and concatenate those files, send them to assets/js where we then minimize the concatenated file.
*/
gulp.task('rjs', function() {
  glob(paths.js.src, function(er, file) {
    customJs = file;

    var customJsOfNumber = customJs.length;

    for(var i = 0; i < customJsOfNumber; i++) {

      jsFileName = customJs[i].substring(customJs[i].lastIndexOf('/') + 1, customJs[i].length - 3);

      gulpMerge(
        gulp.src('./src/assets/vendor/requirejs/require.js')
          .pipe(concat('require.js')),
        gulp.src(paths.js.src, {base: 'src'})
          .pipe(plumber({
            errorHandler: function (error) {
              console.log(error.message);
              this.emit('end');
          }}))
          .pipe(amdOptimize('./src/assets/js/' + jsFileName, {
            configFile: './src/assets/js/base.js'
          }))
          .pipe(concat(jsFileName + ".js"))
      )
      .pipe(concat(jsFileName + ".js"))
      .pipe(gulp.dest(paths.js.dst))
      // .pipe(rename(jsFileName + '.min.js'))
      .pipe(isProduction ? uglify() : gutil.noop())
      .pipe(gulp.dest(paths.js.dst));
    }
  });
});

/**
 * Images
 *
 * Look at src/images, optimize the images and send them to the appropriate place
*/
gulp.task('images', function() {
  // Add the newer pipe to pass through newer images only
  return gulp.src(paths.img.src)
    .pipe(newer(paths.img.dst))
    // .pipe(rimraf({force: true}))
    .pipe(imagemin({optimizationLevel: 7, progressive: true, interlaced: true}))
    .pipe(gulp.dest(paths.img.dst))
    .pipe(notify({message: 'Images task complete', onLast: true}));
});

/**
 * Sprite Generator
 */
gulp.task('sprite', function() {
  // Generate our spritesheet
  var spriteData = gulp.src('src/assets/img/sprites/*.png').pipe(spritesmith({
    imgName: 'sprite.png',
    cssName: '_sprite.scss',
    cssFormat: 'css',
    cssOpts: {
      cssClass: function (item) {
        // If this is a hover sprite, name it as a hover one (e.g. 'home-hover' -> 'home:hover')
        if (item.name.indexOf('-hover') !== -1) {
          return '.icon-' + item.name.replace('-hover', ':hover');
          // Otherwise, use the name as the selector (e.g. 'home' -> 'home')
        } else {
          return '.icon-' + item.name;
        }
      }
    },
  }));

  // Pipe image stream through image optimizer and onto disk
  var imgStream = spriteData.img
    // DEV: We must buffer our stream into a Buffer for `imagemin`
    .pipe(buffer())
    .pipe(imagemin())
    .pipe(gulp.dest('dist/assets/img/'));

  // Pipe CSS stream through CSS optimizer and onto disk
  var cssStream = spriteData.css
    // .pipe(csso())
    .pipe(gulp.dest('dist/assets/css/'));

  // Return a merged stream to handle both `end` events
  return merge(imgStream, cssStream);
});


/**
 * Clean gulp cache
 */
 gulp.task('clear', function () {
   cache.clearAll();
 });

/**
 * Clean tasks for zip
 *
 * Being a little overzealous, but we're cleaning out the build folder, codekit-cache directory and annoying DS_Store files and Also
 * clearing out unoptimized image files in zip as those will have been moved and optimized
 */
gulp.task('cleanupFinal', function() {
  return gulp.src(['./src/bower_components', '**/.sass-cache','**/.DS_Store'], {read: false}) // much faster
    .pipe(ignore('node_modules/**')) //Example of a directory to ignore
    .pipe(rimraf({force: true}))
    // .pipe(notify({ message: 'Clean task complete', onLast: true }));
});

/**
 * Zipping build directory for distribution
 *
 * Taking the build folder, which has been cleaned, containing optimized files and zipping it up to send out as an installable theme
 */
gulp.task('buildZip', function() {
  // return gulp.src([build+'/**/', './.jshintrc','./.bowerrc','./.gitignore' ])
  return gulp.src('dist/**/*')
    .pipe(zip(project + '.zip'))
    .pipe(gulp.dest('./'))
    .pipe(notify({message: 'Zip task complete', onLast: true}));
});

// ==== TASKS ==== //
/**
 * Gulp Default Task
 *
 * Compiles styles, fires-up browser sync, watches js and php files. Note browser sync task watches php files
 *
 */

// Package Distributable Theme
gulp.task('build', ['clean'], function(cb) {
  runSequence(['html', 'fonts', 'images', 'vendorStyles', 'styles', 'rjs'], 'buildZip','cleanupFinal', cb);
});

// Watch Task
gulp.task('default', ['html', 'fonts', 'images', 'vendorStyles', 'styles', 'rjs', 'browser-sync'], function () {
  gulp.watch(['dist/**']).on('change', browserSync.reload);
  gulp.watch('src/**/*.html', ['html']);
  gulp.watch('src/assets/fonts/**/*', ['fonts']);
  gulp.watch('src/assets/img/**/*', ['images']);
  gulp.watch('src/assets/img/sprites/**/*', ['sprite']);
  gulp.watch('src/assets/vendor/**/*', ['vendorStyles']);
  gulp.watch('src/assets/scss/**/*.scss', ['styles']);
  gulp.watch('src/assets/js/**/*.js', ['rjs']);

});



