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

var themesJson      = "./themes.json",
    misc            = "./misc/",
    src             = "./src/",
    dist            = "./dist/",
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

function buildHtml(name) {
    if (name === true) {
        gutil.log("Try " + chalk.blue("gulp build_html --name theme_name"));
        return;
    }

    var dir = dist + name + "/";

    gutil.log("Creating HTML in " + chalk.magenta(dir) + "...");

    mkdirp(dir);

    gulp
        .src(misc + "index.html")
        .pipe(gulp.dest(dir));
}

function buildJs(name) {
    if (name === true) {
        gutil.log("Try " + chalk.blue("gulp build_js --name theme_name"));
        return;
    }

    var dir = dist + name + "/js/";

    gutil.log("Creating " + chalk.magenta(dir) + " and files...");
    mkdirp(dir);

    gulp
        .src([
            bootstrapDist + "js/" + bootstrapJs,
            bootstrapDist + "js/" + bootstrapJsMin
        ])
        .pipe(gulp.dest(dir));
}

function buildFonts(name) {
    if (name === true) {
        gutil.log("Try " + chalk.blue("gulp build_fonts --name theme_name"));
        return;
    }

    var dir = dist + name + "/fonts/";

    gutil.log("Creating " + chalk.magenta(dir) + " and files...");
    mkdirp(dir);

    gulp
        .src(bootstrapDist + "fonts/*")
        .pipe(gulp.dest(dir));
}

function buildCss(name) {
    if (name === true) {
        gutil.log("Try " + chalk.blue("gulp build_css --name theme_name"));
        return;
    }

    var srcDir = src + name + "/less/",
        distDir = dist + name + "/css/";

    gutil.log("Creating " + chalk.magenta(distDir) + "...");
    mkdirp(distDir);

    gutil.log("Writing CSS files to " + chalk.magenta(distDir) + "...");
    gulp
        .src(srcDir + themeLess)
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
        .pipe(out(distDir + bootstrapCss))
        .pipe(csso())
        .pipe(out(distDir + bootstrapCssMin));
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
    //noinspection JSUnresolvedFunction
    return fs.writeFileSync(file, str, options);
}

// new theme
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

gulp.task("build_theme", function (name) {
    if (name === true) {
        gutil.log("Try " + chalk.blue("gulp build_theme --name theme_name"));
        return;
    }

    buildCss(name);
    buildFonts(name);
    buildJs(name);
    buildHtml(name);
});

gulp.task("build", function () {
    gutil.log("Using " + chalk.magenta(themesJson));
    var themesList = readJsonFile(themesJson) || [];

    if (!themesList.length) {
        gutil.log(chalk.red("Themes not found"));
        return;
    }

    _.each(themesList, function (name) {
        buildCss(name);
        buildFonts(name);
        buildJs(name);
        buildHtml(name);
    });
});

// watcher
gulp.task("watch", function () {
    gutil.log("Using " + chalk.magenta(themesJson));
    var themesList = readJsonFile(themesJson) || [];

    if (!themesList.length) {
        gutil.log(chalk.red("Themes not found"));
        return;
    }

    _.each(themesList, function (name) {
        gulp.watch(src + name + "/**/*.less", function () {
            buildCss(name)
        });
    });
});