var gulp         = require("gulp"),                 // Gulp JS
    header       = require("gulp-header"),          // banner maker
    mkdirp       = require("mkdirp"),               // mkdir
    autoprefixer = require('gulp-autoprefixer'),    // Autoprefixer
    less         = require("gulp-less"),            // LESS
    csso         = require('gulp-csso'),            // CSS min
    out          = require('gulp-out');             // to file

var misc            = "./misc/",
    src             = "./src/",
    srcLess         = src + "less/",
    dist            = "./dist/",
    distCss         = dist + "/css/",
    bootstrap       = "./node_modules/bootstrap/",
    bootstrapLess   = bootstrap + "less/",
    bootstrapDist   = bootstrap + "dist/",
    themeLess       = "theme.less",
    bootstrapCss    = "bootstrap.css",
    bootstrapCssMin = "bootstrap.min.css",
    bootstrapJs     = "bootstrap.js",
    bootstrapJsMin  = "bootstrap.min.js";

var pkg = require('./package.json');

var banner = [
    '/*!',
    ' * Copyright (c) <%= new Date().getFullYear() %> <%= pkg.author %>',
    ' * <%= pkg.name %> - <%= pkg.description %> - Based on Bootstrap',
    ' * @version v<%= pkg.version %>',
    ' * @link <%= pkg.repository.url %>',
    ' * @license <%= pkg.license %>',
    ' */',
    ''
].join('\n');

function buildHtml() {
    gulp
        .src(misc + "index.html")
        .pipe(gulp.dest(dist));
}

function buildJs() {
    var dir = dist + "js/";
    mkdirp(dir);

    gulp
        .src([
            bootstrapDist + "js/" + bootstrapJs,
            bootstrapDist + "js/" + bootstrapJsMin
        ])
        .pipe(gulp.dest(dir));
}

function buildFonts() {
    var dir = dist + "fonts/";
    mkdirp(dir);

    gulp
        .src(bootstrapDist + "fonts/*")
        .pipe(gulp.dest(dir));
}

function buildCss() {
    mkdirp(srcLess);
    mkdirp(distCss);

    gulp
        .src(srcLess + themeLess)
        .pipe(less())
        .pipe(autoprefixer({
            browsers: [
                "Android 2.3",
                "Android >= 4",
                "Chrome >= 20",
                "Firefox >= 24",
                "Explorer >= 8",
                "iOS >= 6",
                "Opera >= 12",
                "Safari >= 6"
            ]
        }))
        .pipe(header(banner, {pkg: pkg}))
        .pipe(out(distCss + bootstrapCss))
        .pipe(csso())
        .pipe(out(distCss + bootstrapCssMin));
}

function installCustomTheme() {
    mkdirp(srcLess);

    gulp
        .src(misc + themeLess)
        .pipe(gulp.dest(srcLess));
}

function installCustomVariables() {
    mkdirp(srcLess);

    gulp
        .src(bootstrapLess + "variables.less")
        .pipe(gulp.dest(srcLess));
}

// setup
gulp.task("install_custom_variables", installCustomVariables);
gulp.task("install_custom_theme", installCustomTheme);

gulp.task("install", function () {
    installCustomVariables();
    installCustomTheme();
});

// build
gulp.task("build_css", buildCss);
gulp.task("build_fonts", buildFonts);
gulp.task("build_js", buildJs);
gulp.task("build_html", buildHtml);

gulp.task("build", function () {
    buildCss();
    buildFonts();
    buildJs();
    buildHtml();
});

// watcher
gulp.task("watch", function () {
    // CSS
    gulp.watch(srcLess + "**/*.less", ["build_css"]);
});
