var gulp = require("gulp"),
	del = require("del"),
	to5 = require("gulp-6to5");

gulp.task("clean", function(c) {
	del("dist/**", c);
});

// Transpile to ES5
// JS files inside app-shared/ are currently authored in ES5, hence don't need this
gulp.task("6to5", ["clean"], function() {
	return gulp.src("src/js/*.js", { base: "src/" })
		.pipe(to5())
		.pipe(gulp.dest("dist/"));
});

// Simply copy the rest of the files from src/ to dist/
gulp.task("copy", ["clean"], function() {
	return gulp.src([
			"src/**",
			"!src/js/*.js"
		], { base: "src/" })
		.pipe(gulp.dest("dist/"));
});

gulp.task("default", ["6to5", "copy"]);