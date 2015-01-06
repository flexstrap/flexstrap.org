process.on('uncaughtException', console.log)

var chalk            = require('chalk'),
    clean            = require('gulp-clean'),
    concat           = require('gulp-concat'),
    fs               = require('fs'),
    glob             = require('glob'),
    gulp             = require('gulp'),
    gutil            = require('gulp-util'),
    livereload       = require('gulp-livereload'),
    minimist         = require('minimist'),
    mkdirp           = require('mkdirp'),
    mocha            = require('gulp-mocha'),
    nib              = require('nib'),
    nodemon          = require('gulp-nodemon'),
    path             = require('path'),
    runSequence      = require('run-sequence'),
    sh               = require('execSync'),
    sourcemaps       = require('gulp-sourcemaps'),
    stylus           = require('gulp-stylus'),
    to5              = require('gulp-6to5')

var argv     = minimist(process.argv.slice(2)),
    dest     = gulp.dest,
    sequence = runSequence,
    src      = gulp.src

var watching = function() {

  if(argv._.indexOf('w') > -1 || argv._.indexOf('watch') > -1 || argv._.indexOf('watchify') > -1) {
    return true
  }

  return false

}

gulp.task('b', function(done) {

  sequence('clean', ['copy', 'build-browser', 'styles'], done)

})

gulp.task('build-browser', ['build-browser-app', 'build-browser-flexstrap', 'build-browser-jquery'])

gulp.task('build-browser-app', function() {

  src([
    './app/app.js'
  ])
  .pipe(dest('./public/js/'))

})

gulp.task('build-browser-flexstrap', function() {

  src([
    './bower_components/flexstrap/src/index.js',
    './bower_components/flexstrap/src/components/base/component.js',
    './bower_components/flexstrap/src/components/navigation/index.js'
  ])
  .pipe(to5())
  .pipe(concat('flexstrap.js'))
  .pipe(dest('./public/js'))

})

gulp.task('build-browser-jquery', function() {

  src([
    './bower_components/jquery/dist/jquery.min.js'
  ])
  .pipe(dest('./public/js/'))

})

gulp.task('clean', function(done) {

  /*
  Note, the gulp-clean task is janky
  */
  //src('./public/**/*', {read: false}).pipe(clean())

  sh.run('rm -rf public')

  done()

})

gulp.task('copy', ['generate-app-icons', 'copy-app-assets'])

gulp.task('copy-app-assets', function(done) {

  /*return src([
    //'./bower_components/flexstrap/src/icons/svg/fontello.svg'
  ])
  .pipe(dest('./public/icons'))*/

  done()

})

gulp.task('copy-component-assets', function() {

  return src('components/**/*.svg', {cwd: 'app/'}).pipe(dest('public/components/'))

})

gulp.task('generate-app-icons', function(done) {

  mkdirp.sync(path.join(__dirname, '/public/icons'))

  var icons = fs.readFileSync(path.join(__dirname, './bower_components/flexstrap/src/icons/svg/fontello.svg'), 'utf8')

  icons = icons.split('svg11.dtd">')
  icons = icons[1]
  icons = icons.split('<svg')

  var output = '<svg class="hidden"' + icons[1]

  fs.writeFileSync(path.join(__dirname, './public/icons/fontello.svg'), output, 'utf8')

  done()

})

gulp.task('html', function() {

  return src('**/*.hbs', {read: false})
    .pipe(livereload())
})

gulp.task('styles', ['stylus'])

/*
Note: external sourcemaps are funky atm so they are disabled
*/
gulp.task('stylus', function () {

  return src([
    './bower_components/normalize.css/normalize.css',
    './bower_components/flexstrap/src/icons/animation.css',
    './bower_components/flexstrap/src/icons/fontello.css',
    './bower_components/flexstrap/src/index.styl',
    './server/styles/partials/**/index.styl',
    './server/styles/partials/**/sm.styl',
    './server/styles/partials/**/md.styl',
    './server/styles/partials/**/lg.styl',
    './server/styles/partials/**/xl.styl',
    './server/styles/site.styl',
    './server/styles/views/**/index.styl',
    './server/styles/views/**/sm.styl',
    './server/styles/views/**/md.styl',
    './server/styles/views/**/lg.styl',
    './server/styles/views/**/xl.styl',
    ])
    .pipe(stylus({
      cache: false,
      import: [
        'nib',
        path.join(__dirname, './server/styles/_definitions.styl')
      ],
      paths: [
        __dirname + '/bower_components/flexstrap/src'
      ],
      /*sourcemap: {
        basePath: 'public/css',
        inline: true,
        sourceRoot: '/'
      },*/
      use: [nib()]
    }))
    /*.pipe(sourcemaps.init({
    loadMaps: true
    }))*/
    .pipe(concat('app.css'))
    /*.pipe(sourcemaps.write('./public/css', {
    includeContent: false,
    sourceRoot: '/app'
    }))*/
    .pipe(dest('./public/css'))

})

gulp.task('w', ['b'], function() {
  livereload.listen()

  gulp.watch('server/views/**/*.hbs', ['html'])
  gulp.watch('bower_components/flexstrap/src/**/*.styl', ['stylus'])
  gulp.watch('server/styles/**/*.styl', ['stylus'])
  gulp.watch('public/**').on('change', livereload.changed)

  nodemon({
    env: {'NODE_ENV': 'development'},
    ext: 'hbs js',
    ignore: ['*.css', '*.styl'],
    //nodeArgs: ['--debug'],
    script: 'index.js'})
    //.on('change', ['lint'])
    .on('restart', function () {

      var files = arguments[0]

      files.forEach(function(file) {
        file = file.replace(__dirname, '') // Just show relative file path.

        console.log('File changed:', chalk.yellow(file))
      })

    })

})
