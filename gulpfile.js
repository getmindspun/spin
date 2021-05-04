const gulp = require('gulp');
const pump = require('pump');

// gulp plugins and utils
const livereload = require('gulp-livereload');
const beeper = require('beeper');
const zip = require('gulp-zip');
const sass = require('gulp-sass');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify');
const clean = require('gulp-clean');

function serve(done) {
    livereload.listen();
    done();
}

const handleError = (done) => {
    return function (err) {
        if (err) {
            beeper().then(() => {});
        }
        return done(err);
    };
};

function cleaner(done) {
    pump([
        gulp.src(['assets/built'], {read: false}),
        clean()
    ], done);
}

function hbs(done) {
    pump([
        gulp.src(['*.hbs', 'partials/**/*.hbs']),
        livereload()
    ], done);
}

function scss(done) {
    pump([
        gulp.src('assets/scss/*.scss', {sourcemaps: true}),
        sass({
            outputStyle: 'compressed'
        }),
        gulp.dest('assets/built/', {sourcemaps: '.'}),
        livereload()
    ], done);
}

function js(done) {
    pump([
        gulp.src([
            'node_modules/ghost-theme-utils/dist/js/ghost-theme-utils.js',
            'node_modules/elasticlunr/elasticlunr.js',
            'assets/js/lib/*.js',
            'assets/js/main.js'
        ], {sourcemaps: true}),
        concat('main.min.js'),
        uglify(),
        gulp.dest('assets/built/', {sourcemaps: '.'}),
        livereload()
    ], handleError(done));
}

function zipper(done) {
    const pkg = require('./package.json');
    const targetDir = 'dist/';
    const filename = pkg.name + '-' + pkg.version + '.zip';

    pump([
        gulp.src([
            '**',
            '!node_modules', '!node_modules/**',
            '!dist', '!dist/**',
            '!scss'
        ]),
        zip(filename),
        gulp.dest(targetDir)
    ], done);
}

const scssWatcher = () => gulp.watch(['assets/scss/**'], scss);
const hbsWatcher = () => gulp.watch(['*.hbs', 'partials/**/*.hbs'], hbs);
const jsWatcher = () => gulp.watch(['assets/js/**'], js);
const watcher = gulp.parallel(scssWatcher, hbsWatcher, jsWatcher);
const build = gulp.series(scss, js);

exports.build = build;
exports.zip = gulp.series(build, zipper);
exports.default = gulp.series(build, serve, watcher);
exports.clean = cleaner;
