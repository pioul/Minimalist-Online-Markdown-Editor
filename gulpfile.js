var gulp = require("gulp"),
	uglify = require("uglify-js"),
	CleanCss = require("clean-css"),
	del = require("del"),
	through = require("through2"),
	vinylMap = require("vinyl-map"), // through2 abstraction for accessing file contents only
	path = require("path"),
	babel = require("gulp-babel"),

	paths = {
		base: {
			root: "",
			src: "src/",
			dest: "dist/"
		},
		js: {
			srcGlob: [
				"node_modules/gulp-babel/node_modules/babel-core/browser-polyfill.min.js",
				"src/app-shared/js/libs/**",
				"src/app-shared/js/markdown-it-plugins/markdown-it-map-lines.js",
				"src/app-shared/js/utilities.js",
				"src/app-shared/js/preview.js",
				"src/app-shared/js/main.js",
				"src/js/**",
			],
			relDest: "js/all.js",
			relRevDest: null
		},
		css: {
			srcGlob: "src/app-shared/css/**",
			srcDir: "src/app-shared/css/",
			relDest: "css/all.css",
			relRevDest: null
		},
		html: {
			src: "src/index.html"
		},

		// Negate a glob string or array
		negateGlob: function(glob) {
			var negate = function(str) {
				// If globstar alone in last path portion, also exclude the empty directory itself
				if (str.slice(-3) == "/**") str = str.slice(0, -3) +"{,/**}";

				return "!"+ str;
			};

			if (glob instanceof Array) return glob.map(negate);
				else return negate(glob);
		}
	},

	gulpPlugins = {
		concat: require("gulp-concat"),
		size: require("gulp-size"),
		revision: require("gulp-rev"),
		htmlReplace: require("gulp-html-replace"),

		saveRevFileName: function(assetType) {
			var getRevFileName = function(file) {
					var sep = "/",
						fileBase = file.base.split(path.sep).join(sep), // Replace all without having to escape special regex chars
						filePath = file.path.split(path.sep).join(sep);

					filePath = filePath.replace(fileBase, "");
					if (filePath[0] == sep) filePath = filePath.slice(1); // Make sure this is a relative path

					return filePath;
				},

				write = function(file, enc, cb) {
					paths[assetType].relRevDest = getRevFileName(file);
					cb(null, file);
				};

			return through({ objectMode: true }, write);
		}
	};

// Empty paths.base.dest
gulp.task("clean", function(c) {
	del(paths.base.dest +"**", c);
});

// JS files: concat + minify + cache-bust
gulp.task("build-js", ["clean"], function() {
	var displayOriginalSize = gulpPlugins.size({
			title: "Original JS size"
		}),

		displayFinalSize = gulpPlugins.size({
			title: "Minified + gzipped JS size",
			gzip: true
		}),

		minifyJs = vinylMap(function(contents) {
			return uglify.minify(contents.toString(), {
				fromString: true
			}).code;
		});

	return gulp.src(paths.js.srcGlob, { base: paths.base.src })
		.pipe(gulpPlugins.concat(paths.js.relDest))
		.pipe(displayOriginalSize)
		.pipe(babel())
		.pipe(minifyJs)
		.pipe(displayFinalSize)
		.pipe(gulpPlugins.revision())
		.pipe(gulpPlugins.saveRevFileName("js"))
		.pipe(gulp.dest(paths.base.dest));
});

// CSS files: concat + minify + cache-bust
gulp.task("build-css", ["clean"], function() {
	var displayOriginalSize = gulpPlugins.size({
			title: "Original CSS size"
		}),

		displayFinalSize = gulpPlugins.size({
			title: "Minified + gzipped CSS size",
			gzip: true
		}),

		minifyCss = vinylMap(function (contents) {
			return new CleanCss({
				relativeTo: paths.css.srcDir, // Path to resolve relative URLs
				target: paths.base.src + paths.css.relDest // Path to a folder or an output file to which rebase all URLs; has to use the same paths.base as relativeTo to avoid confusing CleanCss
			}).minify(contents.toString()).styles;
		});

	return gulp.src(paths.css.srcGlob, { base: paths.base.src })
		.pipe(displayOriginalSize)
		.pipe(minifyCss)
		.pipe(gulpPlugins.concat(paths.css.relDest))
		.pipe(displayFinalSize)
		.pipe(gulpPlugins.revision())
		.pipe(gulpPlugins.saveRevFileName("css"))
		.pipe(gulp.dest(paths.base.dest));
});

// Revise assets' references. Currently only bothers to do that in index.html, since JS and CSS are the only
// revised assets; will have to extend to CSS files once fonts and images are also revised.
gulp.task("revise-assets-refs", ["build-js", "build-css"], function() {
	return gulp.src(paths.html.src, { base: paths.base.src })
		.pipe(gulpPlugins.htmlReplace({
			js: paths.js.relRevDest,
			css: paths.css.relRevDest
		}))
		.pipe(gulp.dest(paths.base.dest));
});

// Simply copy the rest of the files from src/ to dist/
gulp.task("copy", ["clean"], function() {
	var src = [].concat(
		"src/**",
		paths.negateGlob(paths.js.srcGlob),
		paths.negateGlob(paths.css.srcGlob),
		paths.negateGlob(paths.html.src)
	);

	return gulp.src(src, { base: paths.base.src })
		.pipe(gulp.dest(paths.base.dest));
});

gulp.task("default", ["build-js", "build-css", "revise-assets-refs", "copy"]);