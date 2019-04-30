'use strict';

const fetch = require('node-fetch');
/**
 * Get list of Geo Fields in Document
 * 
 *
 * info GeoList_Request_Interface 
 * returns List
 **/

const got = require('got');


exports.getGeoFields = function(info) {
  console.log("here")
  return new Promise(function(resolve, reject) {
     
      var url = "http://localhost:9220/"+info.index;
      console.log(url)

      got(url, { json: true }).then(response => {
        //console.log(response.body);
        resolve(response.body[info.index].mappings)
        
      }).catch(error => {
        console.log(error.response.body);
      });
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

