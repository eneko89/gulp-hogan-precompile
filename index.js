'use strict';

var through = require('through2');
var path = require('path');
var gutil = require('gulp-util');
var PluginError = gutil.PluginError;
var hogan = require('hogan.js');
var extend = require('extend');

var PLUGIN_NAME = 'gulp-hogan-precompile';

/**
 * Compile hogan templates into a js file.
 * 
 * @param  {Object}  options  Plugin options.
 *                            See README.md.
 */
module.exports = function compile(options) {

    var templates = {};

    // Plugin and hogan options
    options = extend(true, {
        newLine: gutil.linefeed,
        wrapper: 'amd',
        templateOptions: {},
        templateName: function(file) {
            return path.join(
                path.dirname(file.relative),
                path.basename(file.relative, path.extname(file.relative))
            );
        },
        hoganModule: 'hogan'
    }, options || {});

    // Do not convert to strings if dest is an object
    options.templateOptions.asString = true;

    return through.obj(function (file, enc, callback) {

        if (file.isNull()) {
            return callback(null, file);
        }

        if (file.isStream()) {
            this.emit('error', new PluginError(PLUGIN_NAME,  'Streaming not supported'));
            return callback();
        }

        templates[options.templateName(file)] = hogan.compile(file.contents.toString('utf8'), options.templateOptions);

        var lines = [],
            blanks = options.wrapper ? '    '
                                     : '';

        for (var name in templates) {
            lines.push(blanks + 'templates[\'' + name + '\'] = new Hogan.Template(' + templates[name] + ');');
        }

        // Unwrapped
        lines.unshift('    var templates = {};');

        // All wrappers require a hogan module
        if (options.wrapper) {
            lines.unshift('    var Hogan = require(\'' + options.hoganModule  + '\');');
            lines.push('    return templates;');
        }

        // AMD wrapper
        if (options.wrapper === 'amd') {
            lines.unshift('define(function(require) {');
            lines.push('})');
        }

        // CommonJS wrapper
        else if (options.wrapper === 'commonjs') {
            lines.unshift('module.exports = (function() {');
            lines.push('})();');
        }

        file.contents = new Buffer(lines.join(options.newLine));
        file.path = gutil.replaceExtension(file.path, '.js');

        callback(null, file);

    });

};