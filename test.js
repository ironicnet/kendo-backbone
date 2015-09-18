var _ = require('lodash');
var cp = require('cp-r');
var rimraf = require('rimraf');
var assert = require('assert');
var path = require('path');
var jsdom = require('jsdom');
var SailsApp = require('sails').Sails;
var BackboneClient;

var authHeaders = {
  headers: {
    Authorization: 'Basic YWRtaW46YWRtaW4xMjM0'
  }
};

var sailsConfig = {
  appPath: path.dirname(require.resolve('hashware-api')),
  hooks: {
    grunt: false
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
          window.$.ajax = require('najax');
          global.kendo = window.kendo;
          kendo.jQuery.ajax = require('najax');
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

  describe('DataSource', function () {
    var kendoDataSource, backboneDataSource, testCollection, vanillaCollection;

    before(function (done) {
      this.timeout(60 * 1000);

      global.$ = global._window.$;
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

      testCollection = new sdk.MinerDeviceCollection();
      vanillaCollection = new sdk.MinerDeviceCollection();
    });

    it('can define new vanilla kendo.data.DataSource without error', function () {
      kendoDataSource = new kendo.data.DataSource({
        transport: {
          create: 'http://localhost:1444/api/v1/minerdevice',
          read: 'http://localhost:1444/api/v1/minerdevice',
          update: 'http://localhost:1444/api/v1/minerdevice',
          destroy: 'http://localhost:1444/api/v1/minerdevice'
        }
      });
    });

    it('can request data using vanilla Backbone', function (done) {
      vanillaCollection.fetch()
        .then(function (results) {
          assert(results.length > 1);
          assert(vanillaCollection.length > 1);
          done();
        });
    });

    it('can define new Backbone.DataSource without error', function () {
      backboneDataSource = new kendo.data.Backbone.DataSource({
        collection: testCollection
      });
    });

    it('can fetch new data in vanilla kendo.data.DataSource', function (done) {
      kendoDataSource = new kendo.data.DataSource({
        transport: {
          read: {
            url: 'http://localhost:1444/api/v1/minerdevice',
            dataType: 'json'
          }
        },
        change: function () {
          var items = kendoDataSource.data();
          assert(items.length > 0);
          done();
        }
      });
      kendoDataSource.fetch();
    });

    it('can fetch new data in kendo.data.Backbone.DataSource using kendo fetch', function (done) {
      testCollection = new sdk.MinerDeviceCollection();
      backboneDataSource = new kendo.data.Backbone.DataSource({
        collection: testCollection,
      });
      backboneDataSource.fetch().then(function () {
        var items = backboneDataSource.data();
        assert(items.length > 0);
        assert(testCollection.length > 0);
        done();
      });
    });
    it('can fetch new data in kendo.data.Backbone.DataSource using Backbone fetch', function (done) {
      testCollection = new sdk.MinerDeviceCollection();
      backboneDataSource = new kendo.data.Backbone.DataSource({
        collection: testCollection,
        change: function () {
          var items = backboneDataSource.data();
          assert(items.length > 0);
          assert(testCollection.length > 0);
          if (items.length == testCollection.length) done();
        }
      });
      testCollection.fetch();
    });

  });
});
