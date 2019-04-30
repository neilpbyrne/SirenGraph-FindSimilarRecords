'use strict';


/**
 * Get list of Geo Fields in Document
 * 
 *
 * info GeoList_Request_Interface 
 * returns List
 **/
exports.getGeoFields = function(info) {
  return new Promise(function(resolve, reject) {
    var examples = {};
    examples['application/json'] = [ {
  "index" : "index",
  "results" : [ "results", "results" ]
}, {
  "index" : "index",
  "results" : [ "results", "results" ]
} ];
    if (Object.keys(examples).length > 0) {
      resolve(examples[Object.keys(examples)[0]]);
    } else {
      resolve();
    }
  });
}


/**
 * Get list of Documents within Geo Range
 * 
 *
 * info GeoRange_Request_Interface 
 * returns List
 **/
exports.getInGeoRange = function(info) {
  return new Promise(function(resolve, reject) {
    var examples = {};
    examples['application/json'] = [ {
  "geo" : "geo",
  "index" : "index",
  "range" : "range",
  "results" : [ "{}", "{}" ]
}, {
  "geo" : "geo",
  "index" : "index",
  "range" : "range",
  "results" : [ "{}", "{}" ]
} ];
    if (Object.keys(examples).length > 0) {
      resolve(examples[Object.keys(examples)[0]]);
    } else {
      resolve();
    }
  });
}


/**
 * Get list of Documents within Date Range
 * 
 *
 * info TimeRange_Request_Interface 
 * returns List
 **/
exports.getInTimeRange = function(info) {
  return new Promise(function(resolve, reject) {
    var examples = {};
    examples['application/json'] = [ {
  "date" : "date",
  "index" : "index",
  "range" : "range",
  "results" : [ "{}", "{}" ]
}, {
  "date" : "date",
  "index" : "index",
  "range" : "range",
  "results" : [ "{}", "{}" ]
} ];
    if (Object.keys(examples).length > 0) {
      resolve(examples[Object.keys(examples)[0]]);
    } else {
      resolve();
    }
  });
}


/**
 * Get list of Time Fields in Document
 * 
 *
 * info TimeList_Request_Interface 
 * returns List
 **/
exports.getTimeFields = function(info) {
  return new Promise(function(resolve, reject) {
    var examples = {};
    examples['application/json'] = [ {
  "index" : "index",
  "results" : [ "results", "results" ]
}, {
  "index" : "index",
  "results" : [ "results", "results" ]
} ];
    if (Object.keys(examples).length > 0) {
      resolve(examples[Object.keys(examples)[0]]);
    } else {
      resolve();
    }
  });
}

