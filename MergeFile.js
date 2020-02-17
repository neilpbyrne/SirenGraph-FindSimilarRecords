  /*
  * Advanced Find Similar Records
  *
  *
  * f - refers to kibi helper with following functions available
  *   defaultExpansion(graphid, idList, relations)
  *   executeGremlinQuery(graphId, queryTemplate, idList)
  *   addResultsToGraph(graphId, queriedIds, results)
  *   executeEsSearch(index, type, body, size)
  *   getKibiRelations()
  *   openModal(graphId, title, innerHtml)
  *   handleModalResult(graphId, result)
  *
  * Globals:
  *
  * - kibiTimezone: a string containing the value of the dateFormat:tz setting.
  * - moment: an instance of moment-timezone with the default timezone set to the value of the dateFormat:tz setting.
  *
  * For detailed documentation of the above please contact support team
  *
  * NOTE:
  *   Use ECMAScript 5
  *   The name of the main function must be "beforeAll"
  *   The function should always return a promise which resolves
  *   with a modified graph model
  */
  
  // ID = index/type/id

  var selectedNode = {};
  var entityConnections = [];
  var fields = {};
  var lookup = {};
  var idxLabels = {};
  var queryText = undefined;
  var selectionNodes = [];
  var datelist = [];
  var geolist = [];
  var commonEIDs = [];
  var idsToBeAdded = [];
  
  // var miniHtml = '<style>@import url(https://fonts.googleapis.com/css?family=Cabin:700);@import url(https://fonts.googleapis.com/css?family=Roboto);.wrapper{display:flex; flex-direction:column;}.grid-row{margin-bottom: 1em}.grid-row, .grid-header{display:flex;}.sig-section-comments{display: flex; margin-top:1em; justify-content: flex-end;}.sig-section-comments label{width:180px;}.sig-section-comments textarea{width:67%;}.grid-header{align-items: flex-end;}.header-item{width:100px; text-align:center;}.header-item:nth-child(1){width:180px;}.subtitle{font-size: 0.7em;}.flex-item:before{content: ""; padding-top:26%;}.flex-item{display:flex; width:100px; border-bottom:1px solid #ccc; justify-content: center; align-items:center; font-size: 1em; font-weight:normal; color:#999;}.flex-item:nth-child(1){border:none; font-size:1.15em; color:#000; width:180px; justify-content: left;}[type="radio"], [type="checkbox"]{border: 0; clip: rect(0 0 0 0); height: 1px; margin: -1px; overflow: hidden; padding: 0; position: absolute; width: 1px;}.slider{width: 70%;}.inp{margin-left: 5px; width: 25px; float: left;}.dropdown{margin-right: 20px;}label{cursor: pointer;}[type="radio"] + span:before,[type="checkbox"] + span:before{content: ""; display: inline-block; width: 1.5em; height: 1.5em; vertical-align: -0.25em; border-radius:.25em; border: 0.125em solid #fff; box-shadow: 0 0 0 0.15em #555; transition: 0.5s ease all;}[type="checkbox"] + span:before{margin-right: 0.75em;}[type="radio"]:checked + span:before,[type="checkbox"]:checked + span:before{background: green; box-shadow: 0 0 0 0.25em #666;}/* never forget focus styling */[type="radio"]:focus span:after{content: "\0020\2190"; font-size: 1.5em; line-height: 1; vertical-align: -0.125em;}/* Nothing to see here. */body{font-size:14px; margin: 3em auto; max-width: 40em; font-family: Roboto, sans;}fieldset{font-size: 1em; border: 2px solid #000; padding: 2em; border-radius: 0.5em; margin-bottom: 20px;}legend{color: #fff; background: #000; padding: 0.25em 1em; border-radius: 1em;}button{background-color:#507EDD; border:none; padding:10px; margin-top: 20px; color:white; font-size:1em; width:75%; position:relative; left:12.5%; border-radius:3px; box-shadow: 0 2px 5px 0 rgba(0,0,0,0.36),0 2px 10px 0 rgba(0,0,0,0.12);}</style><fieldset> <legend>Find Similar Records</legend> <div class="wrapper"> <div class="grid-header"> <div class="header-item"></div><div class="header-item" title="Exclude this Entity from search">Ignore</div><div class="header-item" title="Regular Search">Exact</div><div class="header-item" title="Fuzzy">Approx</div><div class="header-item" title="More Like This">MLT</div><div class="header-item" title="Boost">Boost</div></div><div class="grid-row"> <div class="flex-item">City</div><label class="flex-item"> <input type="radio" value="city ignore" name="city" checked> <span></span> </label> <label class="flex-item"> <input type="radio" value="city exact" name="city"> <span></span> </label> <label class="flex-item"> <input type="radio" value="city fuzzy" name="city"> <span></span> </label> <label class="flex-item"> <input type="radio" value="city mlt" name="city"> <span></span> </label> <label class="flex-item"> <div class="slider boost"> <div class="range-slider"> <input class="range-slider__range" type="range" value="1" min="1" max="4"> <span class="range-slider__value">1</span> </div></div></label> </div><div class="grid-row"> <div class="flex-item">Email</div><label class="flex-item"> <input type="radio" value="email ignore" name="email" checked> <span></span> </label> <label class="flex-item"> <input type="radio" value="email auto" name="email"> <span></span> </label> <label class="flex-item"> <input type="radio" value="email fuzzy" name="email"> <span></span> </label> <label class="flex-item"> <input type="radio" value="email mlt" name="email"> <span></span> </label> <label class="flex-item"> <div class="slider boost"> <div class="range-slider"> <input class="range-slider__range" type="range" value="1" min="1" max="4"> <span class="range-slider__value">1</span> </div></div></label> </div><div class="grid-row"> <div class="selecter" style="float:left; width: 30%;"> <label> <input type="checkbox" value="impact" name="consult-sig-sme"> <span>Time Filter</span> </label> </div><div class="slider time"> <div class="time dropdown" style="float: left;"><select> <option value="" selected disabled hidden>Choose here</option> <option value="1">One</option> <option value="2">Two</option> <option value="3">Three</option> <option value="4">Four</option> <option value="5">Five</option> </select> </div><div class="range-slider"> <input class="inp days" type="text" value="0" min="0" max="5000"><div style="float: left;margin: 5px;">days</div><input class="inp months" type="text" value="0" min="0" max="5000"><div style="float: left;margin: 5px;">mths</div><input class="inp years" type="text" value="0" min="0" max="5000"><div style="float: left;margin: 5px;">yrs</div></div></div></div><div class="grid-row"> <div class="selecter" style="float:left; width: 30%;"> <label> <input type="checkbox" value="impact" name="consult-sig-sme"> <span>Geo Filter</span> </label> </div><div class="slider geo" style="float: left;"> <div class="geo dropdown" style="float: left;"><select> <option value="" selected disabled hidden>Choose here</option> <option value="1">One</option> <option value="2">Two</option> <option value="3">Three</option> <option value="4">Four</option> <option value="5">Five</option> </select> </div><div class="range-slider"> <input class="inp metres" type="text" value="0" min="0" max="5000"><div style="float: left;margin: 5px;">m</div><input class="inp km" type="text" value="0" min="0" max="5000"><div style="float: left;margin: 5px;">km</div></div></div></div><div class="grid-row"> <div class="selecter" style="float:left; width: 30%;"> <label> <input type="checkbox" value="impact" name="consult-sig-sme"> <span>Limit Results</span> </label> </div><div class="slider limit"> <div class="range-slider"> <input class="range-slider__range" type="range" value="5" min="0" max="20"> <span class="range-slider__value">0</span> top results </div></div></div><div> <button class="btn btn-save">Find Records</button> </div></div></fieldset>';

//first 2 miniHtml ar eboilerplate
  var miniHtml = '<style>@import url(https://fonts.googleapis.com/css?family=Cabin:700);@import url(https://fonts.googleapis.com/css?family=Roboto);.wrapper{display:flex; flex-direction:column;}.btn{width: 20%;}.btn-warning{margin-right:12%;}.grid-row{margin-bottom: 1em}.grid-row, .grid-header{display:flex;}.sig-section-comments{display: flex; margin-top:1em; justify-content: flex-end;}.sig-section-comments label{width:180px;}.sig-section-comments textarea{width:67%;}.grid-header{align-items: flex-end;}.header-item{width:100px; text-align:center;}.header-item:nth-child(1){width:180px;}.subtitle{font-size: 0.7em;}.flex-item:before{content: ""; padding-top:26%;}.flex-item{display:flex; width:100px; border-bottom:1px solid #ccc; justify-content: center; align-items:center; font-size: 1em; font-weight:normal; color:#999;}.flex-item:nth-child(1){border:none; font-size:1.15em; color:#000; width:180px; justify-content: left;}[type="radio"], [type="checkbox"]{border: 0; clip: rect(0 0 0 0); height: 1px; margin: -1px; overflow: hidden; padding: 0; position: absolute; width: 1px;}.slider{width: 70%;}.inp{margin-left: 5px; width: 25px; float: left;}.dropdown{margin-right: 20px;}label{cursor: pointer;}[type="radio"] + span:before,[type="checkbox"] + span:before{content: ""; display: inline-block; width: 1.5em; height: 1.5em; vertical-align: -0.25em; border-radius:.25em; border: 0.125em solid #fff; box-shadow: 0 0 0 0.15em #555; transition: 0.5s ease all;}[type="checkbox"] + span:before{margin-right: 0.75em;}[type="radio"]:checked + span:before,[type="checkbox"]:checked + span:before{background: green; box-shadow: 0 0 0 0.25em #666;}/* never forget focus styling */[type="radio"]:focus span:after{content: "\0020\2190"; font-size: 1.5em; line-height: 1; vertical-align: -0.125em;}/* Nothing to see here. */body{font-size:14px; margin: 3em auto; max-width: 40em; font-family: Roboto, sans;}fieldset{font-size: 1em; border: 2px solid #000; padding: 2em; border-radius: 0.5em; margin-bottom: 20px;}legend{color: #fff; background: #000; padding: 0.25em 1em; border-radius: 1em;}button{background-color:#507EDD; border:none; padding:10px; margin-top: 20px; color:white; font-size:1em; width:75%; position:relative; left:12.5%; border-radius:3px; box-shadow: 0 2px 5px 0 rgba(0,0,0,0.36),0 2px 10px 0 rgba(0,0,0,0.12);}</style>'
  miniHtml += '<fieldset> <legend>Find Similar Records</legend> <div class="wrapper"> <div class="grid-header"> <div class="header-item"></div><div class="header-item" title="Exclude this Entity from search">Ignore</div><div class="header-item" title="Regular Search">Exact</div><div class="header-item" title="Fuzzy">Approx</div><div class="header-item" title="More Like This">MLT</div><div class="header-item" title="Boost">Boost</div></div>'
  
  // miniHtml += '<div class="grid-row"> <div class="flex-item">Email</div><label class="flex-item"> <input type="radio" value="email ignore" name="email" checked> <span></span> </label> <label class="flex-item"> <input type="radio" value="email auto" name="email"> <span></span> </label> <label class="flex-item"> <input type="radio" value="email fuzzy" name="email"> <span></span> </label> <label class="flex-item"> <input type="radio" value="email mlt" name="email"> <span></span> </label> <label class="flex-item"> <div class="slider boost"> <div class="range-slider"> <input class="range-slider__range" type="range" value="1" min="1" max="4"> <span class="range-slider__value">1</span> </div></div></label> </div>'
  
  ///////////////////////////// ELASTIC QUERY CONSTRUCTION ///////////////////////////////////
  function constructFuzzyQuery(matchOnField, queryText){
    var fuzzy = {};
    var fuzzyparams = {"query": queryText, "boost": 1, "fuzziness": "AUTO", "operator":"OR", "prefix_length": 0, "max_expansions": 50, "fuzzy_transpositions":true, "lenient":true, "zero_terms_query":"ALL"}
    fuzzy.match ={[matchOnField]: fuzzyparams}
    
    return fuzzy;
  }
  
   function constructExactQuery(matchOnField, queryText){
    var exact = {}
    exact.term = {[matchOnField]: queryText}
    console.log(exact)
   
    return exact;
  }
  
  function constructMoreLikeThisQuery(matchOnField, queryText){
    var moreLikeThis = {};
    // moreLikeThis.size = 5;
    // moreLikeThis.query = {};
    moreLikeThis.more_like_this = {};
    moreLikeThis.more_like_this.min_term_freq = 1;
    moreLikeThis.more_like_this.min_doc_freq = 1;
    moreLikeThis.more_like_this.fields = [];

    moreLikeThis.more_like_this.fields.push(matchOnField);
    
    moreLikeThis.more_like_this.like = queryText;

    return moreLikeThis;
  }

  function constructGeoProximityQuery(point, distance, field){
    console.log(point)
    var geoprox;

    if (point && field){
      geoprox = {};
      geoprox.bool = {};
      geoprox.bool.must = {};
      geoprox.bool.must.match_all = {};
      geoprox.bool.filter = {};
      geoprox.bool.filter.geo_distance = {};
      geoprox.bool.filter.geo_distance.distance = distance;
      geoprox.bool.filter.geo_distance[field] = point;
    
      console.log(geoprox.bool.filter.geo_distance[field])
      console.log(JSON.stringify(geoprox))
    }

    return geoprox;
  }

  function constructTimeRangeQuery(field, dateBefore, dateAfter){
    var rangeQuery = {};
    // rangeQuery.query = {};
    rangeQuery.range = {};
    rangeQuery.range[field] = {};
    if (dateAfter) rangeQuery.range[field].gte = dateAfter;
    if (dateBefore) rangeQuery.range[field].lte = dateBefore;
    rangeQuery.range[field].format = "yyyy-MM-dd";
  
    // console.log(JSON.stringify(rangeQuery))
  
    return rangeQuery;
  }
  
  function getIndicesLinkedToAllSelectedEIDs(indicesAndTheirEIDs, selectedEIDs){
    var searches = [];
    Object.keys(indicesAndTheirEIDs).forEach(function(index){
      // for each index loop through selected eids and see if connected
      console.log(index)
      var connectionCount = 0;
      for (eid in selectedEIDs){
        console.log(eid)
        console.log(indicesAndTheirEIDs[index].includes(eid))
        if (indicesAndTheirEIDs[index].includes(eid)>=0){
          connectionCount++;
        }
      }
      if(connectionCount == indicesAndTheirEIDs[index].length){
        searches.push(index)
      }
    });
    return searches;
  }
  
  function getIndexFieldAndQuery(index, eidLinks, node){
    var indexFieldQuerytext = {};
    indexFieldQuerytext["index"] = index;
    console.log(eidLinks)
    for (indices in eidLinks){
      if (index == eidLinks[indices].indexPattern){ // this gets field to search
        indexFieldQuerytext["fieldToSearch"] = eidLinks[indices].field;
      }
      if(eidLinks[indices].indexPattern == node.indexPattern){ // get the field in origin node index pattern that contains query
        indexFieldQuerytext["queryText"] = node.payload[eidLinks[indices].field];
      }
    }
    if (indexFieldQuerytext["index"] && indexFieldQuerytext["fieldToSearch"] && indexFieldQuerytext["queryText"]) return indexFieldQuerytext;
  }
  
  function findCommonIndicesToSearch(selectedNodes, graphModel, eids, timeGeoQuery, limitResults){
    var eidRelationSets = {};
    var indexToEidRelations = {};
    var indexSet = new Set();
     return f.getKibiRelations()
      .then(function (relations) {
        for (relation in relations){
          if (relations[relation].domain.id.substr(0,4) === "eid:"){ // This finds the indices eids are connected to (<-), and the fields in them that we will search
            //first we add index pattern to eid data structure, then we add ieds to index pattern structure. index pattern structure is to determine if index pattern is connected to all eids
            var eidName = relations[relation].domain.label;
            if (!eidRelationSets[eidName]) {
              eidRelationSets[eidName] = [];
            }
            if (!indexToEidRelations[relations[relation].range.indexPattern]) {
              indexToEidRelations[relations[relation].range.indexPattern] = [];
            }
            indexToEidRelations[relations[relation].range.indexPattern].push(eidName)
            var indexPatternAndField = {};
            indexPatternAndField["indexPattern"] = relations[relation].range.indexPattern;
            indexPatternAndField["field"] = relations[relation].rangeField;
            eidRelationSets[eidName].push(indexPatternAndField);
            indexSet.add(relations[relation].range.indexPattern);
          }
        }
        var nodeIndexQueries = [];
        
        for (n in selectedNodes){
          console.log(selectedNodes[n])
          // create a query for each node
         
          
          var INDICES_TO_SEARCH = getIndicesLinkedToAllSelectedEIDs(indexToEidRelations, eids)
          
          for (index in INDICES_TO_SEARCH){
            var nodeQuery = {};
            nodeQuery.query = {};
            nodeQuery.query.bool = {}
            nodeQuery.query.bool.must = [];
            
            var similarityQuery = {};
            similarityQuery.bool = {}
            similarityQuery.bool.should = [];
            // loop through user search type selection
            console.log(eids)
            for (eid in eids){
              var indexFieldQueryText = getIndexFieldAndQuery(INDICES_TO_SEARCH[index], eidRelationSets[eid], selectedNodes[n])
              console.log(indexFieldQueryText)
              if (eids[eid].action == "exact"){
                if (indexFieldQueryText){
                  similarityQuery.bool.should.push(constructExactQuery(indexFieldQueryText.fieldToSearch, indexFieldQueryText.queryText))
                }                
              }
              else if (eids[eid].action == "fuzzy"){
                if (indexFieldQueryText){
                  similarityQuery.bool.should.push(constructFuzzyQuery(indexFieldQueryText.fieldToSearch, indexFieldQueryText.queryText))
                } 
              }
              else if (eids[eid].action == "mlt"){
                if (indexFieldQueryText){
                  similarityQuery.bool.should.push(constructMoreLikeThisQuery(indexFieldQueryText.fieldToSearch, indexFieldQueryText.queryText))
                } 
              }
            }
            if (similarityQuery.bool.should.length > 0){
            nodeQuery.query.bool.must.push(similarityQuery); // added similarity query if exists
            }
            if ((datelist.length > 0) && (timeGeoQuery["time"])){
              // We will see if any selected nodes have a date field, and if user has decided within a range of dates
              for(date in datelist){
                // Here we should convert Date to ms, and user range input to ms
                if (datelist[date].nodeID == selectedNodes[n].id){
                  if (datelist[date].field){
                    var baseDate = convertFromISOtoMS(datelist[date].date);
                    var rangeDate = convertUnitsToMS(timeGeoQuery["time"].timeAmount, timeGeoQuery["time"].timeUnit)
                    var gte = convertFromMS(baseDate - (rangeDate/2)); // Calculate gte (greater than or equal to) param of query
                    var lte = convertFromMS(baseDate + (rangeDate/2)); // Calculate lte (less than or equal to) param of query
          
                    nodeQuery.query.bool.must.push(constructTimeRangeQuery(datelist[date].field, lte, gte));
                  }
                }
              }
            }
            if ((geolist.length > 0) && (timeGeoQuery["geo"])){
              console.log(geolist)
              // We will see if any selected nodes have a date field, and if user has decided within a range of dates
              
                for(geo in geolist){
                  // Here we should create range
                  if (geolist[geo].nodeID == selectedNodes[n].id){
                    if (geolist[geo].field){
                      var range = timeGeoQuery["geo"].geoAmount + timeGeoQuery["geo"].geoUnit;   
                      nodeQuery.query.bool.must.push(constructGeoProximityQuery(geolist[geo].location, range, geolist[geo].field));
                    }
                }
              }
            }
            var indexAndQuery = {};
            indexAndQuery["index"] = INDICES_TO_SEARCH[index].substr(INDICES_TO_SEARCH[index].indexOf(":")+1);;
            indexAndQuery["query"] = nodeQuery;
            indexAndQuery["originNode"] = selectedNodes[n].id;
            indexAndQuery["queryType"] = "eid";
            nodeIndexQueries.push(indexAndQuery)
            console.log("Query for n")
            console.log(JSON.stringify(nodeQuery))
          }
          console.log(nodeIndexQueries)
          
        }
        
     
        return Promise.resolve(nodeIndexQueries)
      });
  }
  
  function convertFromISOtoMS(date){
      var date = new Date(date); 
      var milliseconds = date.getTime() / 1000; 
      return milliseconds
  }
  
  function convertUnitsToMS(amount, units){
    var ms = 0;
    if (units == "years"){
      ms = amount * 365 * 24 * 60 * 60;
    }
    else if (units == "days"){
      ms = amount * 24 * 60 * 60;
    }
    else if (units == "hours"){
      ms = amount * 60 * 60;
    }
    else if (units == "minutes"){
      ms = amount * 60;
    }
    else if (units == "seconds"){
      ms = amount;
    }
    return ms;
  }
  
  function convertFromMS(ms){
    var date = new Date(ms * 1000).toISOString().substring(0,10);
    return date
  }
  
  var metaData = {};
  function extractMetaData(entities){
    for (ent in entities){
      console.log(entities[ent])
      if (entities[ent].indexPattern){
        console.log("we have index pattern type " + entities[ent].indexPattern)
        var timeField;
        if (entities[ent]._objects.indexPattern.timeFieldName){
          timeField = entities[ent]._objects.indexPattern.timeFieldName;
        }
        else{console.log("doesn't have time field")}
        var geoField;
        for (field in entities[ent]._objects.indexPattern.fields){
          console.log("has fields metadata")
          if (entities[ent]._objects.indexPattern.fields[field].type == "geo_point"){
            console.log("has geo point, there fore has meta data")
            geoField = entities[ent]._objects.indexPattern.fields[field].name;
            var metaObject = {};
            metaObject["geoField"] = geoField;
            metaObject["timeField"] = timeField;
            metaData[entities[ent].indexPattern] = metaObject;
            break;
          }
        }
      }
    }
  }

  function beforeAll(graphId, graphModel, graphSelection) {
    return f.getInvestigateEntities()
    .then(function (entities) {
      extractMetaData(entities);
      entities = entities.filter(function(entry){
          return entry.type === "VIRTUAL_ENTITY" && entry.label != ".siren" && !entry.label.includes("-virtual");
      })

      var newGraphSelection = getNodesSelection(graphSelection, graphModel);

      var entityIdSet = _.reduce(graphModel.nodes, function (total, node) {
        total.add(node.entityId);
        return total;
      }, new Set());
      
      selectEntities(entityIdSet, newGraphSelection)
      
      getEntityNextRelationships(entityIdSet, newGraphSelection, entities);

    });
  }

  function getEntityNextRelationships(entityIdSet, newGraphSelection, entities){
    var entityIDs = [];
    entities.forEach(function(entity){
      entityIDs.push(entity.id)
    })
    f.getKibiRelations()
      .then(function (relations) {
        var searchableRelations = [];
        var arrayOfPromises = [];
        
        // Filter relations
        // this set is to avoid showing bidirectional relations, as they would have the same count
        var bidirectionalRelation = new Set();
        _.each(relations, function (relation) {
          if (entityIDs.indexOf(relation.domain.id)>=0){
            searchableRelations.push(relation);
          }
        
        });
        entityConnections = searchableRelations;
      });
  }
  
  function checkIfDomainNodeExists(id, nodes){
    for (var n in nodes){
      if (id === nodes[n].entityId) return true;
    }
    return false;
  }

  function selectEntities(entityIdSet, newGraphSelection){
    // This Function looks at the Graph Nodes Selected anddetermines the unique entity TYPES
    f.getKibiRelations()
      .then(function (relations) {
        
        var arrayOfPromises = [];
        
        commonEIDs = []
        var eidCounts = {};
        var nodeTypesSelected = new Set();

       selectionNodes.forEach(function(ent){ // GET ENTITY TYPES
          if (ent["id"].substr(0, ent["id"].indexOf('/')) !== "VIRTUAL_ENTITY") nodeTypesSelected.add(ent["id"].substr(0, ent["id"].indexOf('/')));
        })
       
        // Filter relations
        // this set is to avoid showing bidirectional relations, as they would have the same count
        var bidirectionalRelation = new Set();
        _.each(relations, function (relation) {

          if (entityIdSet.has(relation.domain.id) && relation.range.type == "VIRTUAL_ENTITY")  {
                     
            //We count the amount of node relations that link to this eid, if = #nodes selected then it is common eid and can be used
            if (checkIfDomainNodeExists(relation.domain.id, selectionNodes)){
              if (!eidCounts[relation.range.label]) eidCounts[relation.range.label] = 0;
              eidCounts[relation.range.label]++;
            }

          }
        });
      // HERE WE establish Common EIDS and keep a list of them
      Object.keys(eidCounts).forEach(function(selection){
        if (eidCounts[selection] === nodeTypesSelected.size){
          commonEIDs.push(selection)
        }
      })

          //We display a list of common EIDs to choose from, and our time and geo filters
          var html = '<div>';
          
          commonEIDs.forEach(function (element) {
              miniHtml += '<div class="grid-row"> <div class="flex-item">'+element+'</div><label class="flex-item"> <input type="radio" value="ignore" name="'+element+'"> <span></span> </label> <label class="flex-item"> <input type="radio" value="exact" name="'+element+'" checked> <span></span> </label> <label class="flex-item"> <input type="radio" value="fuzzy" name="'+element+'"> <span></span> </label> <label class="flex-item"> <input type="radio" value="mlt" name="'+element+'"> <span></span> </label> <label class="flex-item"> <div class="slider boost"><input class="inp" id="'+element+'Boost" type="number" value="1" min="1" max="5">'
              miniHtml += '</div></label> </div>'
    
          });
          
          // Html for Time, Geo, and # of Records
          // Time Field - Check if we have time records, if so, add to dropdown list
          if(datelist.length>0){
              miniHtml += '<div class="grid-row"> <div class="selecter" style="float:left; width: 30%;"> <label> <input type="checkbox" value="time" name="timeInput" checked> <span>Time Filter</span> </label> </div>'
              miniHtml += '<div class="slider time"> <div class="time dropdown" style="float: left;">'
              // miniHtml += '<select id = "time_select"> <option value="" selected disabled hidden>Choose here</option>'
              // for (date in datelist){ 
              // miniHtml += '<option value="'+date +'">'+ datelist[date].type  +'  -  '+ datelist[date].label  +'  -   '+ datelist[date].date  +'</option>'
            // }
             miniHtml += '</select> </div><div class="range-slider"> <input style="width: 50px; margin-right:10px;" value ="1" type="number" id="timeAmount"><select id="timeUnit"><option value="years">years</option><option value="days">days</option><option value="hours">hours</option><option value="minutes">minutes</option><option value="seconds">seconds</option></select></div></div></div>'
            }
            
            if(geolist.length>0){
              miniHtml += '<div class="grid-row"> <div class="selecter" style="float:left; width: 30%;"> <label> <input type="checkbox" value="geo" name="geoInput" checked> <span>Geo Filter</span> </label> </div>'
              miniHtml += '<div class="slider geo"> <div class="time dropdown" style="float: left;">'
              // miniHtml += '<select id = "time_select"> <option value="" selected disabled hidden>Choose here</option>'
              // for (date in datelist){ 
              // miniHtml += '<option value="'+date +'">'+ datelist[date].type  +'  -  '+ datelist[date].label  +'  -   '+ datelist[date].date  +'</option>'
            // }
             miniHtml += '</select> </div><div class="range-slider"> <input style="width: 50px; margin-right:10px;" value ="1" type="number" id="geoAmount"><select id="geoUnit"><option value="km">km</option><option value="m">m</option></select></div></div></div>'
            }
            miniHtml += '<div class="grid-row"> <div class="selecter" style="float:left; width: 30%;"> <label> <input type="checkbox" value="limit" name="limit" checked> <span>Limit Results</span> </label> </div><div class="slider limit"> <input id="limitResults" type="number" value="5" min="1" max="50"></div></div> </div></div></fieldset>';

        // html = html + '</div>';
        html = miniHtml;
        f.openModal(graphId ,'Select the fields you want to base search on', html);

      });
  }

  function readLimitResults(){
    // read the number limiting the results
    var limit = 5;
    if ($("input[name='limit']:checked").val() == "limit"){
      limit = $('#'+"limitResults").val()
    }
    return limit;
  }

  function readUserInputTimeGeo(){
  // read the input for geopoint and the search range
  var timeAndGeo = [];
    if ($("input[name='timeInput']:checked").val() == "time"){
      var timeObject = {}
      
      timeObject["timeAmount"] = $("#timeAmount").val()
      timeObject["timeUnit"] = $("#timeUnit").val()
      timeAndGeo["time"] = timeObject;
    }
    if ($("input[name='geoInput']:checked").val() == "geo"){ 
      var geoObject = {}
      geoObject["geoAmount"] = $("#geoAmount").val()
      geoObject["geoUnit"] = $("#geoUnit").val()  
      timeAndGeo["geo"] = geoObject;
    }
    return timeAndGeo;
  }

  function readUserInputEID(){
    eids = [];
    for (var i = 0; i < commonEIDs.length; i++) {
      var eidSelection = {}
      eidSelection["boost"] = $('#'+commonEIDs[i]+"Boost").val()
      eidSelection["action"] = $("input[name='"+commonEIDs[i]+"']:checked").val()
      if (eidSelection["action"] != "ignore"){ eids[commonEIDs[i]] = eidSelection}
    }
    return eids;
  }

  function getNodesSelection(graphSelection, graphModel) {
    // Here we examine the selected Nodes on the graph. We will also test for presence f geo fields, and time fields, and keep a list of both
    var selection = [];
    selectionNodes = []
    datelist = [];
    geolist = [];
    console.log(metaData)
    if (!graphSelection || graphSelection.length === 0) {
      _.each(graphModel.nodes, function (node) {
        selection.push(node.id);
        selectionNodes.push(node);
      });
    } else {
      var selectionSet = new Set(graphSelection);
      _.each(graphModel.nodes, function (node) {
        if (selectionSet.has(node.id)) {
          selectedNode = node;
          lookup = selectedNode.payload;
              console.log(metaData)

          if (findDatesInNodeRecord(selectedNode, metaData)){
            datelist.push(findDatesInNodeRecord(selectedNode, metaData))
          }
          
          if (findGeoInNodeRecord(selectedNode, metaData)){
            geolist.push(findGeoInNodeRecord(selectedNode, metaData))
          }
          selection.push(node.id);
          selectionNodes.push(node);
        }
      });
    }
    return selection;
  }

  function findGeoInNodeRecord(selectedNode, metadata){
    var objectToExamine = selectedNode.payload;
    var geoMeta = metadata[selectedNode.indexPattern];
    var geoField;
    
    if (geoMeta && geoMeta["geoField"]){
      geoField = geoMeta["geoField"]
    }
    // Check metadata for geoField. If exists, create new object with properties"type", "label", and "geo_point"
    if (geoField){
      // console.log(selectedNode.payload["location"])
       var geoObject = {};
      geoObject["location"] = selectedNode.payload[geoField];
      geoObject["type"] = selectedNode.type;
      geoObject["label"] = selectedNode.label;
      geoObject["field"] = geoField;
      geoObject["indexPattern"] = selectedNode.indexPattern;
      geoObject["nodeID"] = selectedNode.id;
      
      return geoObject;
    }
  }
  
  function findDatesInNodeRecord(selectedNode, metadata){
    var objectToExamine = selectedNode.payload;
    var timeField; 
    
    var timeMeta = metadata[selectedNode.indexPattern];
    if (timeMeta && timeMeta["timeField"]){
      timeField = timeMeta["timeField"];
    }
    // Check metadata for timefield. If exists, create new object with properties"type", "label", and "date"
    if (timeField){
      var timeObject = {};
      timeObject["type"] = selectedNode.type;
      timeObject["label"] = selectedNode.label;
      timeObject["date"] = objectToExamine[timeField];
      timeObject["indexPattern"] = selectedNode.indexPattern;
      timeObject["field"] = timeField;
      timeObject["nodeID"] = selectedNode.id;

      return timeObject;
    }
  }

  function onModalOk(scope, graphModel) {
    var selectedRel = [];
    for (var rel in scope.relations) {
      if (scope.relations.hasOwnProperty(rel)) {
        if (scope.relations[rel]) {
          selectedRel.push(rel);
        }
      }
    }
    return selectedRel;
  }

  function checkObject(relation, manual) {
    return (relation.in == manual.inV) && (relation.out == manual.outV) ; 
    return (relation.label == manual.label) && (relation.in == manual.inV) && (relation.out == manual.outV) ; // as label not owrking we won't test for that now
  }
 
  function createEdges(nodes, newNodes, queryTypes, originNodes, graphModel){
    var edges = [];
    
    console.log(originNodes)
    
    if (originNodes){
      for (originNode in originNodes){
          var weight;
          console.log ("Time weight is " + weight)
          var color;
          var label = queryTypes[originNode]; // this is a data struct that maps each created node id to the type of query that generated it (types are time, geo, and eid)
          if (queryTypes[originNode] === "time"){
            color = "rgb(82, 255, 51)";
            weight = returnPosition(originNode, orderedResults["time"])
          } 
          else if (queryTypes[originNode] === "eid"){
            color = "rgb(255, 51, 240)";
            weight = returnPosition(originNode, orderedResults["eid"])
          } 
          else if (queryTypes[originNode] === "geo"){
            color = "rgb(0, 0, 255)";
            weight = returnPosition(originNode, orderedResults["geo"])
          } 
           var manual = {};
            manual.id = "VE_-"+Math.floor(Math.random()*16777215).toString(16)
            manual.properties = {}
            manual.inV =  originNode// virt is the selected node, the origin of the edge
            manual.label = label
            manual.w = weight
            manual.outV = originNodes[originNode] // this is the target node
            manual.type = "edge";
            manual.c = color;
            manual.direction = "both"
            var adding = true;
            for (relation in graphModel.relations){
              if (checkObject(graphModel.relations[relation], manual)){
                console.log("already exists")
                adding = false;
              }
            }
            if (adding){
              console.log("didn't find object so pushing")
              edges.push(manual)
            }
           
      }
    }
    else{ // This Else contaisn the old way of building edges. Most likely will delete from code
      newNodes.forEach(function(virt){
        nodes.forEach(function(node){
          var weight = returnPosition(node.id, orderedResults["eid"])

          var color;
          var label = queryTypes[virt]; // this is a data struct that maps each created node id to the type of query that generated it (types are time, geo, and eid)
          if (queryTypes[node.id] === "time"){color = "rgb(82, 255, 51)"} 
          else if (queryTypes[node.id] === "eid"){color = "rgb(255, 51, 240)"} 
           
            var manual = {};
            manual.id = "VE_-"+Math.floor(Math.random()*16777215).toString(16)
            manual.properties = {}
            manual.inV = virt // virt is the selected node, the origin of the edge
            manual.label = label
            manual.w = weight
            manual.outV = node.id // this is the target node
            manual.type = "edge";
            manual.c = color;
            manual.direction = "both"
      
            edges.push(manual)
        })
      })
    }

    return edges;
    }

  function returnPosition(id, orderedResult){
    // console.log(id)
    // console.log(orderedResult)
    for (i in orderedResult){
      // console.log(orderedResult[i]._id +  "-" + id)
      if (id == (orderedResult[i]._index + "/" + orderedResult[i]._type + "/" +orderedResult[i]._id)){
        var weight = parseInt(i) + 1;
        return weight;
      }
    }
  }
  function entityResToGraph(selection, graphId, queryTemplate){
    return f.executeGremlinQuery(graphId, queryTemplate, selection)
  }

  function queryLabelElasticSearch(index, query, graphModel){
    // for each index
    return f.executeEsSearch(index, "", query, 1)
    .then(function (searchResults){
        return Promise.resolve(searchResults);
    });
  }
  var ESresultIndex = {};
  
  function extractIDs(hits){
    var ids = [];
    for (var id in hits){
      var res = hits[id];
          var id = res._index + "/" + res._type + "/" + res._id;
      ids.push(id)
    }
    return ids;
  }

  function queryElasticSearch(index, query, graphModel, queryType, size, originNodeID){
    // for each index
    return f.executeEsSearch(index, "", query, size)
    .then(function (searchResults){
       var resultAndType = {};
       resultAndType.type = queryType;
       resultAndType.originNodeID = originNodeID;
       resultAndType.result = searchResults;
      return Promise.resolve(resultAndType);
    });
  }


  var orderedResults = {};
  
 function afterModalClosed(graphId, graphModel, graphSelection, onOkModalResult) {
    
  var selection = getNodesSelection(graphSelection, graphModel);
  var queryTemplate;

  var constructQuery = new Promise(function(resolve, reject) {
    resolve(findCommonIndicesToSearch(selectionNodes, graphModel,readUserInputEID(), readUserInputTimeGeo(), readLimitResults()));
  });
    
  queryPromises = [];

  var queryTypes = [];
  var originNodes = [];

  return constructQuery.then(function(results){

    for(query in results){
      var originNodeID = "";
      if (results[query].originNode){ originNodeID = results[query].originNode}
      var elasticSearchPromise = new Promise(function(resolve, reject) {
        resolve(queryElasticSearch(results[query].index, results[query].query, graphModel, results[query].queryType, readLimitResults(), originNodeID));
      });
      queryPromises.push(elasticSearchPromise);
    }
      
    return Promise.all(queryPromises)
    .then(function(results){

      var arrayofIDs = [];
      var resultType = results.type;
      console.log(results)
    
      // /**************************
      // * Create id from each node in result to send on to Gremlin query and get nodes to be placed on graph
      // * *************************/
      results.forEach(function(result){
        result.result.hits.hits.forEach(function(res){
          if(!orderedResults[result.type]) orderedResults[result.type] = [];
          orderedResults[result.type].push(res);
          
          var id = res._index + "/" + res._type + "/" + res._id;
          queryTypes[id] = result.type;
          originNodes[id] = result.originNodeID;

          arrayofIDs.push(id)
        })
      })
      // console.log(orderedResults["eid"])
      if (orderedResults["time"]) orderedResults["time"].sort((a, b) => (a._score > b._score) ? 1 : -1)
      if (orderedResults["eid"]) orderedResults["eid"].sort((a, b) => (a._score > b._score) ? 1 : -1)
      if (orderedResults["geo"]) orderedResults["geo"].sort((a, b) => (a._score > b._score) ? 1 : -1)

            // console.log(orderedResults)

      /*************** PLACE ALL ON GRAPH***************/
      var query = 'g.V($1)';

      return Promise.all([
        entityResToGraph(arrayofIDs, graphId, query)
      ])
      .then(function ([res1]) {
        
        var edges = []
        var newGraphModel = res1; // .concat(res2);
           
        var addedEdges = createEdges(newGraphModel, graphSelection, queryTypes, originNodes, graphModel)
        
        newGraphModel = newGraphModel.concat(addedEdges)
        
        return f.addResultsToGraph(graphId, arrayofIDs.concat(selection), newGraphModel)
        .then(function(res){
          console.log(res)
        })
      })
    })
    .catch(function(error){
      console.log(error)
    })
    
    })
    .catch(function(error){
      console.log(error)
    })
  }
  
