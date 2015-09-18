"use strict";

// BackboneTransport
// -----------------
//
// INTERNAL TYPE
//
// Define a transport that will move data between
// the kendo DataSource and the Backbone Collection

var _ = require('lodash');

// Constructor Function
function Transport(options) {
  _.extend(this, options);
}

// Instance methods.
// add basic CRUD operations to the transport
_.extend(Transport.prototype, {

  create: function(options) {
    if (this.parameterMap) {
      options.data = this.parameterMap(options.data, 'create');
    }
    var data = options.data;


    // create the model in the collection
    this.colWrap.create(data, function(model) {
      // tell the DataSource we're done
      options.success(model);
    });
  },

  read: function(options) {
    if (this.parameterMap) {
      options.data = this.parameterMap(options.data, 'read');
    }
    return this.colWrap.collection.fetch(_.defaults({
      success: function(collection) {
        options.success(collection.toJSON());
      }
    }, options));
  },

  update: function(options) {
    if (this.parameterMap) {
      options.data = this.parameterMap(options.data, 'update');
    }
    // find the model
    var model = this.colWrap.collection.get(options.data.id);

    // update the model
    model.set(options.data);

    // tell the DataSource we're done
    options.success(options.data);
  },

  destroy: function(options) {
    if (this.parameterMap) {
      options.data = this.parameterMap(options.data, 'destroy');
    }
    // find the model
    var model = this.colWrap.collection.get(options.data.id);

    // remove the model
    this.colWrap.collection.remove(model);

    // tell the DataSource we're done
    options.success(options.data);
  }
});

module.exports = Transport;
