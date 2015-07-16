gulp-hogan-precompile
===

A [gulp][] plugin to compile [mustache][] HTML templates to JavaScript functions using [hogan][].

## Usage

In your gulpfile:

```javascript
var hoganCompiler = require('gulp-hogan-precompile');
var declare = require('gulp-declare');
var concat = require('gulp-concat');

gulp.task('templates', function() {
  gulp.src('templates/**/*.html')
      .pipe(hoganCompiler())
      .pipe(declare({
        namespace: 'templates',
        noRedeclare: true
      }))
      .pipe(concat('templates.js'))
      .pipe(gulp.dest('js/'));
});
```

This will compile the mustache templates in the `templates/` folder into JavaScript with `hogan.compile()`. Then, it will define them in the 'templates' namespace with [`gulp-declare`][gulp-declare] plugin, and finally, merge and write them to  `js/templates.js` file.

For example, for the following folder structure

```
├── gulpfile.js                # Your gulpfile
└── templates/                 # Your tempaltes
    ├── layout.html            # A template that will be available as templates.layout
    └── home/                  # A folder to group some templates
        └── foo.html           # A template that will be available as templates.foo
```

It would generate:

```js
this["templates"] = this["templates"] || {};
this["templates"]["layout"] = new Hogan.Template( /* compiled template */ );
this["templates"]["foo"] = new Hogan.Template( /* compiled template */ );
```


## Compiling to various module systems

See the [`gulp-define-module`][gulp-define-module] documentation for details on how to define templates as AMD, CommonJS, and hybrid modules.

For example, to compile the previous folder structure to AMD:

```javascript
var hoganCompiler = require('gulp-hogan-precompile');
var defineModule = require('gulp-define-module');
var concat = require('gulp-concat');

gulp.task('templates', function() {
  gulp.src('templates/**/*.html')
      .pipe(hoganCompiler())
      .pipe(defineModule('amd'))
      .pipe(concat('templates.js'))
      .pipe(gulp.dest('js/'));
});
```

[`gulp-define-module`][gulp-define-module] let's you define a custom wrapper for templates (e.g. `new MyApp.Hogan.Template( /* compiled template */ )`) with [`options.wrapper`][options.wrapper], which defaults to false (no wrapper), but first you must disable the default wrapper in `gulp-hogan-precompile` providing an options object with `wrap` set to `false`:

```javascript
gulp.task('templates', function() {
  gulp.src('templates/**/*.html')
      .pipe(hoganCompiler({
        wrap: false
      }))
      .pipe(defineModule('amd', {
        wrapper: 'new MyApp.Hogan.Template(<%= contents %>)'
      }))
      .pipe(concat('templates.js'))
      .pipe(gulp.dest('js/'));
});
```

`gulp-hogan-precompile` also sets a default [`options.require`][options.require] of `{ Hogan: 'hogan.js' }` for [`gulp-define-module`][gulp-define-module] so Hogan will be present into defined AMD, CommonJS, or hybrid modules. You can change this by passing a different `options.require` when you invoke `gulp-define-module`.


## API

### hoganCompiler(options)

#### options.compilerOptions
Type: `Object`

Compiler options to pass to `hogan.compile()`.

#### options.wrap
Type: `Boolean`

Tells this plugin to wrap compiled templates in `new Hogan.Template( /* compiled template */ )` or not. Defaults to true.


[gulp]:http://gulpjs.com
[mustache]:http://mustache.github.io
[hogan]:https://github.com/twitter/hogan.js
[gulp-define-module]:https://github.com/wbyoung/gulp-define-module
[options.require]:https://github.com/wbyoung/gulp-define-module#optionsrequire
[options.wrapper]:https://github.com/wbyoung/gulp-define-module#optionswrapper
[gulp-declare]:https://github.com/lazd/gulp-declare