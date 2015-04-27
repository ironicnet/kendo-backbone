var _ = require('lodash');
var cp = require('cp-r');
var rimraf = require('rimraf');
var assert = require('assert');
var path = require('path');
var jsdom = require('jsdom');
var SailsApp = require('sails').Sails;
var BackboneClient;

var sailsConfig = {
  appPath: path.dirname(require.resolve('hashware-api')),
  hooks: {
    grunt: false
  },
  config: {
    permissions: {
      adminUsername: 'admin@sailsjs.org',
      adminPassword: 'admin1234',
      adminEmail: 'admin@sailsjs.org'
    }
  },
  models: {
    connection: 'unittest-memory'
  },
  connections: {
    'unittest-memory': {
      adapter: 'sails-memory'
    }
  },
  log: {
    level: 'error'
  },
  port: 1444
};
var url = 'http://localhost:1444/api/v1/backbonemodel';
var app = new SailsApp();
var sdk = { };

describe('kendo-backbone', function () {
  var env;

  describe('pre-requisites', function () {
    it('should check prerequisite existence of kendo.data', function () {
      assert.throws(function () {
        require('./');
      }, Error);
    });
    it('copy memory adapter into appPath due to sails issue', function (done) {
      rimraf.sync('node_modules/hashware-api/node_modules/sails-memory');
      cp('node_modules/sails-memory', 'node_modules/hashware-api/node_modules/sails-memory')
        .read(done);
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
          global._window = window;
          done(err);
        }
      });
    });

    it('should load kendo.data.Backbone', function () {
      var kdb = kendo.data.Backbone = require('./');
      assert(kdb.Model);
      assert(kdb.Collection);
      assert(kdb.DataSource);
    });

  });

  describe('kendo.data.Backbone.DataSource', function () {
    var kendoDataSource, backboneDataSource, testCollection;

    before(function (done) {
      this.timeout(60 * 1000);

      global.$ = {
        ajax: require('najax')
      };
      BackboneClient = require('sails-backbone-client');

      app.lift(sailsConfig, function (error, sails) {
        if (error) return done(error);

        BackboneClient.create(url, { })
          .then(function (_sdk) {
            sdk = _sdk;
            done(error);
          })
          .catch(done);
      });
    });

    it('sanity check sails-permissions models + collections', function () {
      assert(sdk.Permission);
      assert(sdk.Model);
      assert(sdk.Role);
      assert(sdk.User);
      assert(sdk.PermissionCollection);
      assert(sdk.ModelCollection);

      testCollection = new sdk.PermissionCollection();
    });
    
    it('can define new vanilla kendo.data.DataSource without error', function () {
      kendoDataSource = new kendo.data.DataSource({
        url: 'http://localhost:1444/permission'
      });
    });

    it('can define new Backbone.DataSource without error', function () {
      kendoDataSource = new kendo.data.Backbone.DataSource({
        collection: testCollection
      });
    });

  });
});
