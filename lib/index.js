var _ = require('lodash');
var kendo = global.kendo;

if (!kendo || !kendo.data) {
  throw new Error('kendo.data not found');
}
if (_.isObject(kendo.data.Backbone)) {
  throw new Error('kendo.data.Backbone already initialized!');
}

module.exports = {
  Model: require('./kendo.backbone.model'),
  Collection: require('./kendo.backbone.collection'),
  DataSource: require('./backbone.datasource')
};
