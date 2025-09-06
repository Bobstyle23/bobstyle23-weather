const gulp = require("gulp");

require("./gulp/dev.js");
require("./gulp/docs.js");
require("./gulp/fonts.dev.js");
require("./gulp/fonts.docs.js");

// NOTE: default gulp task to watch every change
gulp.task(
  "default",
  gulp.series(
    "clean:dev",
    "fonts.dev",
    gulp.parallel(
      "html:dev",
      "sass:dev",
      "images:dev",
      gulp.series("svgStack:dev", "svgSymbol:dev"),
      "fonts:dev",
      "files:dev",
      "js:dev",
    ),
    gulp.parallel("server:dev", "watch:dev"),
  ),
);

// NOTE: docs task
gulp.task(
  "docs",
  gulp.series(
    "clean:docs",
    "fonts.docs",
    gulp.parallel(
      "html:docs",
      "sass:docs",
      "images:docs",
      gulp.series("svgStack:docs", "svgSymbol:docs"),
      "fonts:docs",
      "files:docs",
      "js:docs",
    ),
    gulp.parallel("server:docs"),
  ),
);
