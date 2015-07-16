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
      stream.on('data', function(file) {
        should.exist(file);
        should.exist(file.contents);
        path.basename(file.path).should.equal('file.js');
        Buffer.isBuffer(file.contents).should.equal(true);
        done();
      });
      stream.write(getFakeFile('test/file.html', 'hello {{place}}'));
      stream.end();
    });

    it('should use options.wrap', function(done) {
      var noWrapStream = compile({ wrap: false });
      var wrapStream = compile({ wrap: true });
      noWrapStream.on('data', function(file) {
        file.contents.toString().should.match(/^\{code\:/);
        wrapStream.on('data', function(file) {
          file.contents.toString().should.match(/^new Hogan\.Template\(/);
          done();
        });
        wrapStream.write(getFakeFile('test/file.html', 'hello {{place}}'));
        wrapStream.end();
      });
      noWrapStream.write(getFakeFile('test/file.html', 'hello {{place}}'));
      noWrapStream.end();
    });

    it('should set gulp-define-module options on files', function(done) {
      var stream = compile();
      stream.on('data', function(file) {
        should.exist(file);
        should.exist(file.defineModuleOptions);
        file.defineModuleOptions.require.Hogan.should.equal('hogan.js');
        done();
      });
      stream.write(getFakeFile('test/file.html', 'hello {{place}}'));
      stream.end();
    });


  });
});
