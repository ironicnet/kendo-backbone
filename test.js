var _ = require('lodash');
var assert = require('assert');
var jsdom = require('jsdom');

describe('kendo-backbone', function () {
  var env;

  describe('pre-requisites', function () {
    it('should check prerequisite existence of kendo.ui', function () {
      assert.throws(function () {
        require('./');
      }, Error);
    });
  });

  describe('sanity', function () {
  
    before(function (done) {
      this.timeout(10000);
      env = jsdom.env({
        html: '<div />',
        scripts: [
          'https://code.jquery.com/jquery-2.1.3.min.js',
          'http://cdn.kendostatic.com/2014.3.1411/js/kendo.all.min.js'
        ],
        done: function (err, window) {
          global.kendo = window.kendo;
          done(err);
        }
      });
    });


  });
});
