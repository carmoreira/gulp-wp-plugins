/**
 * Gulp File for my WordPress Plugin Development
 *
 * Perform actions such as:
 *
 *   
 *   - Enable browserSync
 *   - Watch for Changes (to trigger browser reload and minify)
 *   - Create .pot translation files 
 *      -> gulp translate-plugin-name / gulp translate-all
 *   - Create plugins zip file 
 *      -> gulp zip-plugin-name / gulp zip-all
 *   - Minify CSS e JS 
 *      -> gulp minjs-plugin-name / gulp minjs-all
 *      -> gulp mincss-plugin-name / gulp mincss-all
 *
 * @author Carlos Moreira (@carmoreira)
 * @version 1.1
 */
/**
 *
 * Configuration
 *
 * Setup the variables that we will use in the tasks
 *
 */
var plugins = [];

plugins.push({
        name: "Team Showcase",
        folder: "team-showcase",
        shortname: "tshowcase",
        cssfolder: "/css/",
        jsfolder: "/js/",
        langfolder: "/lang/",
        domain: "tshowcase",
    }, {
        name: "Logos Showcase",
        folder: "logos-showcase",
        shortname: "lshowcase",
        cssfolder: "/css/",
        jsfolder: "/js/",
        langfolder: "/lang/",
        domain: "lshowcase",
    }, {
        name: "Testimonials Showcase",
        folder: "testimonials-showcase",
        shortname: "ttshowcase",
        langfolder: "/lang/",
        domain: "ttshowcase",

    }, {
        name: "Interactive World Maps",
        folder: "interactive-world-maps",
        shortname: "iwm",
        cssfolder: "/includes/",
        jsfolder: "/includes/",
        langfolder: "/lang/",
        domain: "iwm",
    }, {
        name: "Visited Countries Generator",
        folder: "visited-countries-generator",
        shortname: "vcshowcase",
        cssfolder: "/assets/css/",
        jsfolder: "/assets/js/",
        langfolder: "/lang/",
        domain: "vcshowcase",
    }, {
        name: "Advisor Quiz",
        folder: "advisor-quiz",
        shortname: "quiz",
        cssfolder: ["/assets/css/", "/admin/css/"],
        jsfolder: ["/assets/js/", "/admin/js/"],
        langfolder: "/lang/",
        domain: "advq",
    }

);


var devURL = 'http://localhost/abril/';
var host = 'localhost/abril/'
var zipfolder = './../dist'; //we create the zip folder one directory above this, which should be the plugins folder
var ziparchive = './../archive'; //we create an extra zip with data sufix to archive

/**
 * Load Plugins.
 *
 * Load gulp plugins and passing them semantic names.
 */
var gulp = require('gulp'); // Gulp of-course

//Zip Plugin
var zip = require('gulp-zip');

//CSS Plugin
var minifycss = require('gulp-uglifycss'); // Minifies CSS files.


//Minify JS
var uglify = require('gulp-uglify');
var pump = require('pump');

//Translation 
var wpPot = require('gulp-wp-pot'); // For generating the .pot file.
var sort = require('gulp-sort'); // Recommended to prevent unnecessary changes in pot-file.


//Utility plugins
var rename = require('gulp-rename'); // Helps with renaming
var notify = require('gulp-notify'); // Sends message notifications
var browserSync = require('browser-sync').create(); // Reloads browser and injects CSS. Time-saving synchronised browser testing.
var reload = browserSync.reload; // For manual browser reload.
var sourcemaps = require('gulp-sourcemaps'); // Map minified files to original files


/**
 * Task: `browser-sync`.
 *
 * Live Reloads, CSS injections, Localhost tunneling.
 *
 */
gulp.task('browser-sync', function() {
    browserSync.init({

        // Project URL.
        proxy: devURL,
        host: host,
        open: true,
        injectChanges: true,
        //port: 80

    });
});



//arrays to store all tasks & dependencies
var ziptasks = [],
    translatetasks = [],
    minjstasks = [],
    mincsstasks = [],
    watchtasks = [];

//loop through the plugins array to build the tasks
for (var i = plugins.length - 1; i >= 0; i--) {
    create_tasks(i);
}

function create_tasks(e) {

    var plugin = plugins[e];
    var slug = plugin.folder;
    var dir = './../' + slug;
    var zipdepencies = [];

    /*
     * Translation Tasks
     * We'll create the .pot translation file
     */

    var translateTaskName = 'translate-' + plugin.shortname;
    var translationFile = plugin.domain + '.pot';
    var phpfiles = dir + '/**/*.php';

    translatetasks.push(translateTaskName);
    zipdepencies.push(translateTaskName);

    gulp.task(translateTaskName, function() {
        return gulp.src(phpfiles)
            .pipe(sort())
            .pipe(wpPot({
                domain: plugin.domain,
                package: plugin.slug,
            }))
            .pipe(gulp.dest(dir + plugin.langfolder + translationFile))
        //.pipe( notify( { message: 'TASK: "translate" for '+plugin.name+' Completed! 💯', onLast: true } ) );

    });

    

    /*
     * Minify JS Tasks
     * We'll minify versions of the files
     */

    //only run if there's a jsfolder defined
    if (plugin.hasOwnProperty('jsfolder')) {

        var jsfiles;
        var jsdestination;

        if (Array.isArray(plugin.jsfolder)) {
            jsfiles = [];

            for (var i = plugin.jsfolder.length - 1; i >= 0; i--) {
                jsdestination = dir + plugin.jsfolder[i];
                jsfiles.push(jsdestination + '*.js',
                    '!' + jsdestination + '/*.min.js');
            };
        } else {
            jsdestination = dir + plugin.jsfolder;
            jsfiles = [jsdestination + '*.js',
                '!' + jsdestination + '/*.min.js'
            ]; //to ignore already mininfied files
        }
        var minjsTaskName = 'minjs-' + plugin.shortname;
        minjstasks.push(minjsTaskName);
        zipdepencies.push(minjsTaskName);

        gulp.task(minjsTaskName, function(cb) {
            pump([
                    gulp.src(jsfiles),
                    sourcemaps.init(),
                    uglify(),
                    rename({
                        suffix: '.min'
                    }),
                    sourcemaps.write('.', {
                        includeContent: false,
                        sourceRoot: '.'
                    }),
                    gulp.dest(function(file) {
                        return file.base;
                    })
                ],
                cb
            );
        });
    }

    /*
     * Minify CCS Tasks
     * We'll minify versions of the files
     */

    if (plugin.hasOwnProperty('cssfolder')) {

        var cssfiles;
        var cssdestination;

        if (Array.isArray(plugin.cssfolder)) {
            cssfiles = [];

            for (var i = plugin.cssfolder.length - 1; i >= 0; i--) {
                cssdestination = dir + plugin.cssfolder[i];
                cssfiles.push(cssdestination + '*.css',
                    '!' + cssdestination + '/*.min.css');
            };
        } else {
            cssdestination = dir + plugin.cssfolder;
            cssfiles = [cssdestination + '*.css',
                '!' + cssdestination + '/*.min.css'
            ]; //to ignore already mininfied files
        }

        var mincssTaskName = 'mincss-' + plugin.shortname;

        mincsstasks.push(mincssTaskName);
        zipdepencies.push(mincssTaskName);

        gulp.task(mincssTaskName, function() {
            gulp.src(cssfiles)
                .pipe(sourcemaps.init())
                .pipe(browserSync.stream())
                .pipe(minifycss({
                    "maxLineLen": 80,
                    "uglyComments": true
                }))
                .pipe(rename({
                    suffix: '.min'
                }))
                .pipe(sourcemaps.write('.', {
                    includeContent: false,
                    sourceRoot: '.'
                }))
                .pipe(gulp.dest(function(file) {
                    return file.base;
                }))
        });

    }

    /*
     * Zip Tasks
     * Let's create the zip tasks for each plugin 
     */
     
    var ziptaskname = 'zip-' + plugin.shortname;

    ziptasks.push(ziptaskname);

    gulp.task(ziptaskname, zipdepencies, function() {

        //we create a date to attach to zip file name
        var dateObj = new Date();
        var month = dateObj.getUTCMonth() + 1; //months from 1-12
        var day = dateObj.getUTCDate();
        var year = dateObj.getUTCFullYear();
        var tmzipname = slug + '_' + day + '_' + month + '_' + year;


        return gulp.src([
                dir + '/**/*',
                '!' + dir + '/{node_modules,node_modules/**/*}',
                '!' + dir + '/assets/{sass,sass/*}',
                '!' + dir + '/gulpfile.js',
                '!' + dir + '/package.json',
                '!' + dir + '/package-lock.json',
                '!' + dir + '/dist', //these last 2 lines are to ignore the dist folder
                '!' + dir + '/dist/*' //and it's contents if it exists
            ], {
                base: './../'
            }) //we added the base, so the zip file would contain the name of the folder
            .pipe(zip(slug + '.zip')) //we create a zip file in the parent plugins folder
            .pipe(gulp.dest(zipfolder))
            .pipe(rename(tmzipname + '.zip')) //we rename it and place it in the old_dist folder
            .pipe(gulp.dest(ziparchive)); //why? well... for versioning?

    });

    /*
     * Watch Tasks
     * We'll setup the folders to watch and what to do
     */

    var watchTaskname = 'watch-' + plugin.shortname;
    watchtasks.push(watchTaskname);

    gulp.task(watchTaskname, function() {

        if (plugin.hasOwnProperty('jsfolder')) {
            gulp.watch(jsfiles, [minjsTaskName, reload]);
        }
        if (plugin.hasOwnProperty('cssfolder')) {
            gulp.watch(cssfiles, [mincssTaskName]);
        }

        gulp.watch(dir + '/**/*.php', [reload]);

    });

}

//To perform all tasks
gulp.task('zip-all', ziptasks);
gulp.task('translate-all', translatetasks);
gulp.task('minjs-all', minjstasks);
gulp.task('mincss-all', mincsstasks);
gulp.task('watch-all', watchtasks);
//Default Task
gulp.task('default', ['watch-all', 'browser-sync']);