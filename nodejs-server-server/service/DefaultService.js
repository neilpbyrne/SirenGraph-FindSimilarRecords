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
  info.type = "doc";
  return new Promise(function(resolve, reject) {
     
      var url = "http://localhost:9220/"+info.index;
      console.log(url)

      got(url, { json: true }).then(response => {
        resolve(getFieldTypeList(response.body[info.index].mappings[info.type].properties || {}, "geo_point"));
        //resolve(response.body[info.index].mappings);
        
      }).catch(error => {
        console.log(error.response.body);
      });
  });
}

function getFieldTypeList(fields, type){
 // console.log(fields)
  var fieldList = [];
  Object.keys(fields).forEach(function(key, index) {
    console.log(fields[key]);
    if (fields[key].type === type){
      fieldList.push(key);
    }
  });
  return fieldList;
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
  info.type = "doc";
  return new Promise(function(resolve, reject) {
    var url = "http://localhost:9220/"+info.index+"/"+info.type+"/_search";

    fetch(url,
      {
          method: 'POST',
          body: JSON.stringify(constructTimeRangeQuery("Start_Date", info.date, info.range)),
          headers:{
              'Content-Type': 'application/json',
          }
      })
      .then(function(result){
         // console.log(result.json())
          return result.json();
      })
      .then(function(json){
        resolve(json);
      })
      .catch(function(error){
        resolve(error);
      })
  });
}

function constructTimeRangeQuery(field, dateBefore, dateAfter){
  var rangeQuery = {};
  rangeQuery.query = {};
  rangeQuery.query.range = {};
  rangeQuery.query.range[field] = {};
  if (dateAfter) rangeQuery.query.range[field].gte = dateAfter;
  if (dateBefore) rangeQuery.query.range[field].lte = dateBefore;
  rangeQuery.query.range[field].format = "dd/MM/yyyy||yyyy||yyyy-MM-dd";

  return rangeQuery;
}


/**
 * Get list of Time Fields in Document
 * 
 *
 * info TimeList_Request_Interface 
 * returns List
 **/
exports.getTimeFields = function(info) {
  console.log("here")
  info.type = "doc";
  return new Promise(function(resolve, reject) {
     
      var url = "http://localhost:9220/"+info.index;
      console.log(url)

      got(url, { json: true }).then(response => {
        resolve(getFieldTypeList(response.body[info.index].mappings[info.type].properties || {}, "date"));
        //resolve(response.body[info.index].mappings);
        
      }).catch(error => {
        console.log(error.response.body);
      });
  });
}

