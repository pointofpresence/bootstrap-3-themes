var gulp = require("gulp-param")(require("gulp"), process.argv);

var header       = require("gulp-header"),          // banner maker
    mkdirp       = require("mkdirp"),               // mkdir
    autoprefixer = require('gulp-autoprefixer'),    // Autoprefixer
    less         = require("gulp-less"),            // LESS
    csso         = require('gulp-csso'),            // CSS min
    out          = require('gulp-out'),             // to file
    fs           = require("fs"),                   // fs
    gutil        = require("gulp-util"),            // log and other
    chalk        = require('chalk'),                // colors
    _            = require("underscore");           // underscore

var themesJson = "./themes.json";

var misc            = "./misc/",
    src             = "./src/",
    dist            = "./dist/",
    distCss         = dist + "/css/",
    bootstrap       = "./node_modules/bootstrap/",
    bootstrapLess   = bootstrap + "less/",
    bootstrapDist   = bootstrap + "dist/",
    themeLess       = "theme.less",
    variablesLess   = "variables.less",
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

function readJsonFile(file, options) {
    try {
        return JSON.parse(fs.readFileSync(file, options))
    } catch (err) {
        return null
    }
}

function writeFileSync(file, obj, options) {
    var spaces = null, str = JSON.stringify(obj, null, spaces) + '\n';
    return fs.writeFileSync(file, str, options);
}

// setup
gulp.task("install_custom_variables", installCustomVariables);
gulp.task("install_custom_theme", installCustomTheme);

gulp.task("add", function (name) {
    if (name === true) {
        gutil.log("Try " + chalk.blue("gulp add --name theme_name"));
        return;
    }

    var themesList = readJsonFile(themesJson) || [];

    if (_.contains(themesList, name)) {
        gutil.log(chalk.red("'" + name + "' already exists"));
        return;
    }

    gutil.log("Initilizing new '" + chalk.cyan(name) + "' theme...");

    var srcDir = src + name + "/",
        srcLess = srcDir + "less/";

    gutil.log("Creating " + chalk.magenta(srcLess) + "...");

    mkdirp(srcLess);

    gutil.log("Creating " + chalk.magenta(srcLess + variablesLess) + "...");

    gulp
        .src(bootstrapLess + variablesLess)
        .pipe(gulp.dest(srcLess));

    gutil.log("Creating " + chalk.magenta(srcLess + themeLess) + "...");

    gulp
        .src(misc + themeLess)
        .pipe(gulp.dest(srcLess));

    gutil.log("Saving " + chalk.magenta(themesJson) + "...");

    themesList.push(name);
    writeFileSync(themesJson, themesList);
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
