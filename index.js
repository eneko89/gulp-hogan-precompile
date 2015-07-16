'use strict';

var through = require('through2');
var gutil = require('gulp-util');
var PluginError = gutil.PluginError;
var hogan = require('hogan.js');
var extend = require('extend');

var PLUGIN_NAME = 'gulp-hogan-precompile';

/**
 * Compile hogan templates into a js file.
 * 
 * @param  {Object}  [options]  Plugin options.
 *                              See README.md.
 */
module.exports = function compile(options) {

  var declared = false;

  // Plugin and hogan options.
  options = extend(true, {
    compilerOptions: {},
    wrap: true
  }, options || {});

  // Allways convert compiled functions to string.
  options.compilerOptions.asString = true;

  return through.obj(function (file, enc, callback) {

    if (file.isNull()) {
      return callback(null, file);
    }

    if (file.isStream()) {
      this.emit('error', new PluginError(PLUGIN_NAME, 'Streaming not supported'));
      return callback();
    }

    // Compiled tamplate function as string.
    var template = hogan.compile(file.contents.toString('utf8'),
                                 options.compilerOptions);

    if (options.wrap) {
      template = 'new Hogan.Template(' + template + ')'
    }

    file.contents = new Buffer(template);
    file.path = gutil.replaceExtension(file.path, '.js');

    // Options that take effect when used with gulp-define-module.
    file.defineModuleOptions = {
      require: {
        Hogan: 'hogan.js'
      }
    }

    callback(null, file);

  });

};