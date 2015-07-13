'use strict';

var compile = require('../');
var should = require('should');
var path = require('path');
var gutil = require('gulp-util');
var File = gutil.File;
var Buffer = require('buffer').Buffer;

describe('gulp-hogan-precompile', function() {

    function getFakeFile(path, content) {
        return new File({
            cwd: '',
            base: 'test/',
            path: path,
            contents: new Buffer(content)
        });
    }

    describe('compile()', function() {

        it('should compile templates', function(done) {
            var stream = compile();
            stream.on('data', function(newFile) {
                should.exist(newFile);
                should.exist(newFile.contents);
                path.basename(newFile.path).should.equal('file.js');
                Buffer.isBuffer(newFile.contents).should.equal(true);
                done();
            });
            stream.write(getFakeFile('test/file.html', 'hello {{place}}'));
            stream.end();
        });

        it('should use options.newLine', function(done) {
            var stream = compile({
                newLine: '\r\n'
            });
            stream.on('data', function(newFile){
                var lines = newFile.contents.toString().split('\r\n');
                lines.length.should.equal(6);
                done();
            });
            stream.write(getFakeFile('test/file.html', 'hello {{place}}'));
            stream.end();
        });

        it('should compile string templates to amd modules', function(done) {
            var stream = compile();
            stream.on('data', function(newFile){
                var lines = newFile.contents.toString().split(gutil.linefeed);
                lines[0].should.equal('define(function(require) {');
                lines[1].should.equal('    var Hogan = require(\'hogan\');');
                lines[2].should.equal('    var templates = {};');
                lines[3].should.match(/templates\['file'\] = new Hogan.Template/);
                lines.pop().should.equal('})');
                lines.pop().should.equal('    return templates;');
                done();
            });
            stream.write(getFakeFile('test/file.html', 'hello {{place}}'));
            stream.end();
        });

        it('should compile string templates to commonjs modules', function(done) {
            var stream = compile({
                wrapper: 'commonjs'
            });
            stream.on('data', function(newFile){
                var lines = newFile.contents.toString().split(gutil.linefeed);
                lines[0].should.equal('module.exports = (function() {');
                lines[1].should.equal('    var Hogan = require(\'hogan\');');
                lines[2].should.equal('    var templates = {};');
                lines[3].should.match(/templates\['file'\] = new Hogan.Template/);
                lines.pop().should.equal('})();');
                lines.pop().should.equal('    return templates;');
                done();
            });
            stream.write(getFakeFile('test/file.html', 'hello {{place}}'));
            stream.end();
        });

    });
});
