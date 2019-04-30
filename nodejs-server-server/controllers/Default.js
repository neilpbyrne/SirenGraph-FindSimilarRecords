'use strict';

var utils = require('../utils/writer.js');
var Default = require('../service/DefaultService');

module.exports.getGeoFields = function getGeoFields (req, res, next) {
  var info = req.swagger.params['info'].value;
  Default.getGeoFields(info)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.getInGeoRange = function getInGeoRange (req, res, next) {
  var info = req.swagger.params['info'].value;
  Default.getInGeoRange(info)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.getInTimeRange = function getInTimeRange (req, res, next) {
  var info = req.swagger.params['info'].value;
  Default.getInTimeRange(info)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.getTimeFields = function getTimeFields (req, res, next) {
  var info = req.swagger.params['info'].value;
  Default.getTimeFields(info)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};
