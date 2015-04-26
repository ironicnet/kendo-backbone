var _ = require('lodash');
var kendo = global.kendo;

if (!kendo || !kendo.data) {
  throw new Error('kendo.data not found');
}

module.exports = {
  BackboneCollection: require('./kendo.backbone.collection'),
  BackboneDatasource: require('./backbone.datasource'),
  BackboneModel: require('./kendo.backbone.model')
};
