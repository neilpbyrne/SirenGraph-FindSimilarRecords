  /*
  * Find Similar Records
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
  
  // var miniHtml = '<style>@import url(https://fonts.googleapis.com/css?family=Cabin:700);@import url(https://fonts.googleapis.com/css?family=Roboto);.wrapper{display:flex; flex-direction:column;}.grid-row{margin-bottom: 1em}.grid-row, .grid-header{display:flex;}.sig-section-comments{display: flex; margin-top:1em; justify-content: flex-end;}.sig-section-comments label{width:180px;}.sig-section-comments textarea{width:67%;}.grid-header{align-items: flex-end;}.header-item{width:100px; text-align:center;}.header-item:nth-child(1){width:180px;}.subtitle{font-size: 0.7em;}.flex-item:before{content: ""; padding-top:26%;}.flex-item{display:flex; width:100px; border-bottom:1px solid #ccc; justify-content: center; align-items:center; font-size: 1em; font-weight:normal; color:#999;}.flex-item:nth-child(1){border:none; font-size:1.15em; color:#000; width:180px; justify-content: left;}[type="radio"], [type="checkbox"]{border: 0; clip: rect(0 0 0 0); height: 1px; margin: -1px; overflow: hidden; padding: 0; position: absolute; width: 1px;}.slider{width: 70%;}.inp{margin-left: 5px; width: 25px; float: left;}.dropdown{margin-right: 20px;}label{cursor: pointer;}[type="radio"] + span:before,[type="checkbox"] + span:before{content: ""; display: inline-block; width: 1.5em; height: 1.5em; vertical-align: -0.25em; border-radius:.25em; border: 0.125em solid #fff; box-shadow: 0 0 0 0.15em #555; transition: 0.5s ease all;}[type="checkbox"] + span:before{margin-right: 0.75em;}[type="radio"]:checked + span:before,[type="checkbox"]:checked + span:before{background: green; box-shadow: 0 0 0 0.25em #666;}/* never forget focus styling */[type="radio"]:focus span:after{content: "\0020\2190"; font-size: 1.5em; line-height: 1; vertical-align: -0.125em;}/* Nothing to see here. */body{font-size:14px; margin: 3em auto; max-width: 40em; font-family: Roboto, sans;}fieldset{font-size: 1em; border: 2px solid #000; padding: 2em; border-radius: 0.5em; margin-bottom: 20px;}legend{color: #fff; background: #000; padding: 0.25em 1em; border-radius: 1em;}button{background-color:#507EDD; border:none; padding:10px; margin-top: 20px; color:white; font-size:1em; width:75%; position:relative; left:12.5%; border-radius:3px; box-shadow: 0 2px 5px 0 rgba(0,0,0,0.36),0 2px 10px 0 rgba(0,0,0,0.12);}</style><fieldset> <legend>Find Similar Records</legend> <div class="wrapper"> <div class="grid-header"> <div class="header-item"></div><div class="header-item" title="Exclude this Entity from search">Ignore</div><div class="header-item" title="Regular Search">Exact</div><div class="header-item" title="Fuzzy">Approx</div><div class="header-item" title="More Like This">MLT</div><div class="header-item" title="Boost">Boost</div></div><div class="grid-row"> <div class="flex-item">City</div><label class="flex-item"> <input type="radio" value="city ignore" name="city" checked> <span></span> </label> <label class="flex-item"> <input type="radio" value="city exact" name="city"> <span></span> </label> <label class="flex-item"> <input type="radio" value="city fuzzy" name="city"> <span></span> </label> <label class="flex-item"> <input type="radio" value="city mlt" name="city"> <span></span> </label> <label class="flex-item"> <div class="slider boost"> <div class="range-slider"> <input class="range-slider__range" type="range" value="1" min="1" max="4"> <span class="range-slider__value">1</span> </div></div></label> </div><div class="grid-row"> <div class="flex-item">Email</div><label class="flex-item"> <input type="radio" value="email ignore" name="email" checked> <span></span> </label> <label class="flex-item"> <input type="radio" value="email auto" name="email"> <span></span> </label> <label class="flex-item"> <input type="radio" value="email fuzzy" name="email"> <span></span> </label> <label class="flex-item"> <input type="radio" value="email mlt" name="email"> <span></span> </label> <label class="flex-item"> <div class="slider boost"> <div class="range-slider"> <input class="range-slider__range" type="range" value="1" min="1" max="4"> <span class="range-slider__value">1</span> </div></div></label> </div><div class="grid-row"> <div class="selecter" style="float:left; width: 30%;"> <label> <input type="checkbox" value="impact" name="consult-sig-sme"> <span>Time Filter</span> </label> </div><div class="slider time"> <div class="time dropdown" style="float: left;"><select> <option value="" selected disabled hidden>Choose here</option> <option value="1">One</option> <option value="2">Two</option> <option value="3">Three</option> <option value="4">Four</option> <option value="5">Five</option> </select> </div><div class="range-slider"> <input class="inp days" type="text" value="0" min="0" max="5000"><div style="float: left;margin: 5px;">days</div><input class="inp months" type="text" value="0" min="0" max="5000"><div style="float: left;margin: 5px;">mths</div><input class="inp years" type="text" value="0" min="0" max="5000"><div style="float: left;margin: 5px;">yrs</div></div></div></div><div class="grid-row"> <div class="selecter" style="float:left; width: 30%;"> <label> <input type="checkbox" value="impact" name="consult-sig-sme"> <span>Geo Filter</span> </label> </div><div class="slider geo" style="float: left;"> <div class="geo dropdown" style="float: left;"><select> <option value="" selected disabled hidden>Choose here</option> <option value="1">One</option> <option value="2">Two</option> <option value="3">Three</option> <option value="4">Four</option> <option value="5">Five</option> </select> </div><div class="range-slider"> <input class="inp metres" type="text" value="0" min="0" max="5000"><div style="float: left;margin: 5px;">m</div><input class="inp km" type="text" value="0" min="0" max="5000"><div style="float: left;margin: 5px;">km</div></div></div></div><div class="grid-row"> <div class="selecter" style="float:left; width: 30%;"> <label> <input type="checkbox" value="impact" name="consult-sig-sme"> <span>Limit Results</span> </label> </div><div class="slider limit"> <div class="range-slider"> <input class="range-slider__range" type="range" value="5" min="0" max="20"> <span class="range-slider__value">0</span> top results </div></div></div><div> <button class="btn btn-save">Find Records</button> </div></div></fieldset>';

//first 2 miniHtml ar eboilerplate
  var miniHtml = '<style>@import url(https://fonts.googleapis.com/css?family=Cabin:700);@import url(https://fonts.googleapis.com/css?family=Roboto);.wrapper{display:flex; flex-direction:column;}.grid-row{margin-bottom: 1em}.grid-row, .grid-header{display:flex;}.sig-section-comments{display: flex; margin-top:1em; justify-content: flex-end;}.sig-section-comments label{width:180px;}.sig-section-comments textarea{width:67%;}.grid-header{align-items: flex-end;}.header-item{width:100px; text-align:center;}.header-item:nth-child(1){width:180px;}.subtitle{font-size: 0.7em;}.flex-item:before{content: ""; padding-top:26%;}.flex-item{display:flex; width:100px; border-bottom:1px solid #ccc; justify-content: center; align-items:center; font-size: 1em; font-weight:normal; color:#999;}.flex-item:nth-child(1){border:none; font-size:1.15em; color:#000; width:180px; justify-content: left;}[type="radio"], [type="checkbox"]{border: 0; clip: rect(0 0 0 0); height: 1px; margin: -1px; overflow: hidden; padding: 0; position: absolute; width: 1px;}.slider{width: 70%;}.inp{margin-left: 5px; width: 25px; float: left;}.dropdown{margin-right: 20px;}label{cursor: pointer;}[type="radio"] + span:before,[type="checkbox"] + span:before{content: ""; display: inline-block; width: 1.5em; height: 1.5em; vertical-align: -0.25em; border-radius:.25em; border: 0.125em solid #fff; box-shadow: 0 0 0 0.15em #555; transition: 0.5s ease all;}[type="checkbox"] + span:before{margin-right: 0.75em;}[type="radio"]:checked + span:before,[type="checkbox"]:checked + span:before{background: green; box-shadow: 0 0 0 0.25em #666;}/* never forget focus styling */[type="radio"]:focus span:after{content: "\0020\2190"; font-size: 1.5em; line-height: 1; vertical-align: -0.125em;}/* Nothing to see here. */body{font-size:14px; margin: 3em auto; max-width: 40em; font-family: Roboto, sans;}fieldset{font-size: 1em; border: 2px solid #000; padding: 2em; border-radius: 0.5em; margin-bottom: 20px;}legend{color: #fff; background: #000; padding: 0.25em 1em; border-radius: 1em;}button{background-color:#507EDD; border:none; padding:10px; margin-top: 20px; color:white; font-size:1em; width:75%; position:relative; left:12.5%; border-radius:3px; box-shadow: 0 2px 5px 0 rgba(0,0,0,0.36),0 2px 10px 0 rgba(0,0,0,0.12);}</style>'
  miniHtml += '<fieldset> <legend>Find Similar Records</legend> <div class="wrapper"> <div class="grid-header"> <div class="header-item"></div><div class="header-item" title="Exclude this Entity from search">Ignore</div><div class="header-item" title="Regular Search">Exact</div><div class="header-item" title="Fuzzy">Approx</div><div class="header-item" title="More Like This">MLT</div><div class="header-item" title="Boost">Boost</div></div>'
  
  // miniHtml += '<div class="grid-row"> <div class="flex-item">Email</div><label class="flex-item"> <input type="radio" value="email ignore" name="email" checked> <span></span> </label> <label class="flex-item"> <input type="radio" value="email auto" name="email"> <span></span> </label> <label class="flex-item"> <input type="radio" value="email fuzzy" name="email"> <span></span> </label> <label class="flex-item"> <input type="radio" value="email mlt" name="email"> <span></span> </label> <label class="flex-item"> <div class="slider boost"> <div class="range-slider"> <input class="range-slider__range" type="range" value="1" min="1" max="4"> <span class="range-slider__value">1</span> </div></div></label> </div>'
  
  ///////////////////////////// ELASTIC QUERY CONSTRUCTION ///////////////////////////////////
  function constructFuzzyQuery(queryText, matchOnField){
    var fuzzy = {};
    fuzzy.match = {};
    fuzzy.match[matchOnField] = {};
    fuzzy.match[matchOnField].query = queryText;
    fuzzy.match[matchOnField].boost = 1;
    fuzzy.match[matchOnField].fuzziness = "AUTO";
    fuzzy.match[matchOnField].operator = "OR";
    fuzzy.match[matchOnField].prefix_length = 0;
    fuzzy.match[matchOnField].max_expansions = 50;
    fuzzy.match[matchOnField].fuzzy_transpositions = true;
    fuzzy.match[matchOnField].lenient = true;
    fuzzy.match[matchOnField].zero_terms_query = "ALL";

    return fuzzy;
  }
  
   function constructExactQuery(queryText, matchOnField){
    var exact = {};
    exact.match = {};
    exact.match[matchOnField] = {};
    exact.match[matchOnField].query = queryText;
    exact.match[matchOnField].boost = 1;

    return exact;
  }
  
  function constructMoreLikeThisQuery(fieldsToCompare, queryContent){
    var moreLikeThis = {};
    // moreLikeThis.size = 5;
    // moreLikeThis.query = {};
    moreLikeThis.more_like_this = {};
    moreLikeThis.more_like_this.min_term_freq = 1;
    moreLikeThis.more_like_this.min_doc_freq = 1;
    moreLikeThis.more_like_this.fields = [];

    moreLikeThis.more_like_this.fields.push(fieldsToCompare);
    
    moreLikeThis.more_like_this.like = queryContent;

    return moreLikeThis;
  }

  function constructGeoProximityQuery(point, distance, field){
    // console.log(point)
    //var pointObj = JSON.parse(point);
    // console.log(pointObj)
    var geoprox = {};
    // geoprox.query = {};
    geoprox.bool = {};
    geoprox.bool.must = {};
    geoprox.bool.must.match_all = {};
    geoprox.bool.filter = {};
    geoprox.bool.filter.geo_distance = {};
    geoprox.bool.filter.geo_distance.distance = distance;
    geoprox.bool.filter.geo_distance[field] = point;
  
    // console.log(JSON.stringify(geoprox))
  
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
  
  function findCommonIndicesToSearch(selectedNodes, graphModel, eids, timeGeoQuery, limitResults){
    var eidRelationSets = {};
     return f.getKibiRelations()
      .then(function (relations) {
        // console.log(relations)
        for (relation in relations){
          // console.log(relations[relation].domain.id.substr(0,4))
          if (relations[relation].domain.id.substr(0,4) === "eid:"){ // This finds the indices eids are connected to (<-), and the fields in them that we will search
            var eidName = relations[relation].domain.label;
            // console.log(eidName)
            if (!eidRelationSets[eidName]) {eidRelationSets[eidName] = [];}
            var indexPatternAndField = {};
            indexPatternAndField["indexPattern"] = relations[relation].range.indexPattern;
            indexPatternAndField["field"] = relations[relation].rangeField;
            eidRelationSets[eidName].push(indexPatternAndField);
          }
          
        }
        // console.log(eidRelationSets) // Level 2 search
        // console.log(eids) // Level 1 search
        // console.log(selectedNodes) // Level3 search
        
        var targetIndices = [];
        
        var queries = [];
        var fieldList = [];
        // Top Level of Query
        Object.keys(eids).forEach(function(eid){ // For each EID, if 'action' is mlt/fuzzy/exact we first construct the query by finding common connecting source index patterns, then adding content of that connecting 'field' to the query string
          var queryTerm = "";
          
          if (eids[eid].action === "mlt" || eids[eid].action === "exact" || eids[eid].action ==="fuzzy"){ // search type mlt, so we construct the query term
          var eidIndices = eidRelationSets[eid]; // select one eid, list of connecting index patterns
            for(var indexPattern in eidIndices){
              
              
              var index = eidIndices[indexPattern].indexPattern;
              var field = eidIndices[indexPattern];
              //Constructing list of indexes to search, and an associated list of fields
              if (!fieldList[index]){ fieldList[index] = [];}
              if (fieldList[index].indexOf(field.field) < 0) {fieldList[index].push(field.field)}
              // now we have connecting index and field, we see if selected nodes are of this type
              for (var node in selectedNodes){
                var ip = selectedNodes[node];
                if (ip.indexPattern === index){ // we matched the connecting index to a selected node, now we concat the query term
                  if(ip.payload[field.field]){
                    queryTerm += ip.payload[field.field] + " ";  
                  }
                  
                }
              }
              queryTerm = queryTerm.trim();
              
            }
            var query = {};
            query["queryTerm"] = queryTerm;
            query["type"] = eids[eid].action;
            // query["fields"] = fieldList;
            queries.push(query);
            //CONSTRUCT query indent 1 (corresponds to selected EID and action)
          }
          
      });
      // TODO: Now that we have queries, we filter eid Relation Sets so that only index Patterns that are common to each EID will be searched
      // As an aside, we can test each index pattern to see if it will also be a target index to be searched
      // var targetIndex = filterTargetIndicesToBeSearched(eidRelationSets, eidIndices, indexPattern)
       var esQueries = [];
      var query = {};
      query.query = {};
      query.query.bool = {}
      query.query.bool.should = [];
     
      console.log(datelist)
        if ((datelist.length > 0) && (timeGeoQuery)){
          console.log("here")
        // We will see if any selected nodes have a date field, and if user has decided within a range of dates
         for(date in datelist){
            var datequery = {};
            datequery.query = {};
            // datequery.query.bool = {}
            // datequery.query.bool.should = [];
            console.log(timeGeoQuery)
            
            // Here we should convert Date to ms, and user range input to ms
            var baseDate = convertFromISOtoMS(datelist[date].date);
            var rangeDate = convertUnitsToMS(timeGeoQuery["time"].timeAmount, timeGeoQuery["time"].timeUnit)
            var gte = convertFromMS(baseDate - (rangeDate/2)); // Calculate gte (greater than or equal to) param of query
            var lte = convertFromMS(baseDate + (rangeDate/2)); // Calculate lte (less than or equal to) param of query
            console.log(gte, lte,  datelist[date].date)
           
            datequery.query = constructTimeRangeQuery(datelist[date].field, lte, gte);
            console.log(JSON.stringify(datequery))
            var esDateQuery = {};
            esDateQuery.index = datelist[date].indexPattern.substr(datelist[date].indexPattern.indexOf(":")+1);
            esDateQuery.query =datequery;
            console.log(esDateQuery)
            esDateQuery.queryType = "time";
            esDateQuery.originNode = datelist[date].nodeID;
            esQueries.push(esDateQuery)
          }
         
      }
     
      for (var quer in fieldList){
        // we iterate through index pattern list. If number of fields matches number of level 1 query types, then we continue, as this proves common connectivity
        // console.log(fieldList[quer])
        // console.log(quer)
        if (fieldList[quer].length === queries.length){
          // this is good to search, construct query. Loop through query terms
          for (var queryBlock in queries){
            // console.log(queries[queryBlock])
            if (queries[queryBlock].type === "mlt"){
              // console.log(fieldList[quer][queryBlock])
              // console.log(queries[queryBlock].queryTerm)
              query.query.bool.should.push(constructMoreLikeThisQuery(fieldList[quer][queryBlock], queries[queryBlock].queryTerm));
              
            }
            else if (queries[queryBlock].type === "fuzzy"){
              query.query.bool.should.push(constructFuzzyQuery(queries[queryBlock].queryTerm, fieldList[quer][queryBlock]));

            }
            else if (queries[queryBlock].type === "exact"){
              // console.log(fieldList[quer][queryBlock])
              // console.log(queries[queryBlock].queryTerm)
              query.query.bool.should.push(constructExactQuery(queries[queryBlock].queryTerm, fieldList[quer][queryBlock]));
            }
          }
          console.log(selectedNodes[0].id)
          var esQuery = {};
          esQuery.index = quer.substr(quer.indexOf(":")+1);
          esQuery.query = query;
          esQuery.originNode = selectedNodes[0].id
          esQuery.queryType = "eid";
          esQueries.push(esQuery)
        }
        
       // queryElasticSearch(quer.substr(quer.indexOf(":")+1), query, graphModel)
      }
      console.log(esQueries)
            return Promise.resolve(esQueries)
      });
      
  }
  function convertFromISOtoMS(date){
      var date = new Date(date); 
      var milliseconds = date.getTime() / 1000; 
      console.log(milliseconds)
      return milliseconds
  }
  function convertUnitsToMS(amount, units){
    console.log(amount)
    console.log(units)
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
    console.log(ms)
    return ms;
  }
  function convertFromMS(ms){
    console.log(ms)
    var date = new Date(ms * 1000).toISOString().substring(0,10);
    console.log(date)
    return date
  }
  

  function beforeAll(graphId, graphModel, graphSelection) {

    return f.getInvestigateEntities()
    .then(function (entities) {
      console.log(entities)
        
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
    // console.log(id)
    for (var n in nodes){
      console.log(nodes[n])
      if (id === nodes[n].entityId) return true;
    }
    return false;
  }

    var commonEIDs = []


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
              
              if(geolist.length>100){ // large number to hide div for now
              miniHtml += '<div class="grid-row"> <div class="selecter" style="float:left; width: 30%;"> <label> <input type="checkbox" value="geo" name="geo"> <span>Geo Filter</span> </label> </div><div class="slider geo" style="float: left;"> <div class="geo dropdown" style="float: left;">'
              // miniHtml += '<select id="geo_select"> <option value="" selected disabled hidden>Choose here</option>' 
              // for (geo in geolist){
              //   miniHtml += '<option value="'+geo +'">'+ geolist[geo].type  +'  -  '+ geolist[geo].label  +'  -   '+ geolist[geo].lat  +' -   '+ geolist[geo].lon  +'</option>' 
              // }
              miniHtml += '</select> </div><div class="range-slider"> <input class="geo_metres inp " type="text" value="0" min="0" max="5000"><div style="float: left;margin: 5px;">m</div><input class="inp geo_km" type="text" value="0" min="0" max="5000"><div style="float: left;margin: 5px;">km</div></div></div></div>'
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
    
    
    console.log($("input[name='timeInput']:checked").val())

    if ($("input[name='timeInput']:checked").val() == "time"){
      var timeAndGeo = [];
       var timeObject = {}
      
      timeObject["timeAmount"] = $("#timeAmount").val()
      timeObject["timeUnit"] = $("#timeUnit").val()
      console.log(timeObject)
      timeAndGeo["time"] = timeObject;
      return timeAndGeo;
    }
    if ($("input[name='geoInput']:checked").val() =="geo"){ 
      var timeAndGeo = [];
      var geoObject = {}
      geoObject["geoDropdown"] = geolist[$("#geo_select").val()]
      geoObject["metres"] = $('.geo_metres').val()
      geoObject["km"] = $('.geo_km').val()
      
      timeAndGeo["geo"] = geoObject;
      return timeAndGeo;
    }
    console.log(timeAndGeo)
    return;
  }

var selectionNodes = [];
var datelist = [];
var geolist = [];

function readUserInputEID(){
  eids = [];
  for (var i = 0; i < commonEIDs.length; i++) {
    var eidSelection = {}
    eidSelection["boost"] = $('#'+commonEIDs[i]+"Boost").val()
    eidSelection["action"] = $("input[name='"+commonEIDs[i]+"']:checked").val()
    eids[commonEIDs[i]] = eidSelection
  }
  
  return eids;
}

  function getNodesSelection(graphSelection, graphModel) {
    // Here we examine the selected Nodes on the graph. We will also test for presence f geo fields, and time fields, and keep a list of both

    var selection = [];
    selectionNodes = []
    datelist = [];
    geolist = [];
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
          console.log(selectedNode)
          if (findDatesInNodeRecord(selectedNode)){
            datelist.push(findDatesInNodeRecord(selectedNode))
          }
          
          if (findGeoInNodeRecord(selectedNode)){
            geolist.push(findGeoInNodeRecord(selectedNode))
          }
          selection.push(node.id);
          selectionNodes.push(node);
        }
      });
      console.log(datelist)
      console.log(geolist)

    }
    
    return selection;
  }

  function checkForLatLon(objectToTest, type, label, indexPattern){
    // For now we use a weak check on field names to see if we are dealing with lat lon
    //need a more robust check that won't see numbers as lat/lon
    if (objectToTest["lat"] && objectToTest["lon"]){
       //set lat and lon
       var geoObject = {};
     
     geoObject["lat"] = objectToTest.lat
     geoObject["lon"] = objectToTest.lon
     geoObject["type"] = type
     geoObject["label"] = label
     geoObject["indexPattern"] = indexPattern
     geolist.push(geoObject)
     }
     else if (objectToTest["lat"] && objectToTest["long"]){
       //set lat and lon
       var geoObject = {};
  
     geoObject["lat"] = objectToTest.lat
     geoObject["lon"] = objectToTest.long
     geoObject["type"] = type
     geoObject["label"] = label
    geoObject["indexPattern"] = indexPattern

     geolist.push(geoObject)
     }
     else if (objectToTest["lat"] && objectToTest["lng"]){
       //set lat and lon
       var geoObject = {};
  
     geoObject["lat"] = objectToTest.lat
     geoObject["lon"] = objectToTest.lng
     geoObject["type"] = type
     geoObject["label"] = label
          geoObject["indexPattern"] = indexPattern

     geolist.push(geoObject)
     }
     else if (objectToTest["latitude"] && objectToTest["longitude"]){
       //set lat and lon
       var geoObject = {};
     
     geoObject["lat"] = objectToTest.latitude
     geoObject["lon"] = objectToTest.longitude
     geoObject["type"] = type
     geoObject["label"] = label
          geoObject["indexPattern"] = indexPattern


     geolist.push(geoObject)
     }
    
     findSubObjects(objectToTest, type, label, indexPattern)
  }
  
  function findSubObjects(objectToTest,type,label, indexPattern){
       //recusively search within each object branch to see if a geopoint exists
       
       for (var key in objectToTest){
         //test to see if property is object, if so, test for lat lon
        if (objectToTest[key] instanceof Object){
           checkForLatLon(objectToTest[key], type, label, indexPattern)
           
        }
       }
  }

 function findGeoInNodeRecord(selectedNode){
    // if(checkForLatLon(selectedNode, selectedNode.type, selectedNode.label, selectedNode.indexPattern, "root")){
       if(findGeoStringInPayload(selectedNode)) return     
 }
  
  function findGeoStringInPayload(selectedNode){
    // Whereas the above trio of functions will recursively search nested objects and test for lat/lon object property pairs
    // This will simply search ONE tier of selected node payload looking for geo location object
    // console.log(selectedNode)
    for (loc in selectedNode.payload){
      // console.log(selectedNode.payload[loc])
      // try {
        // console.log(selectedNode.payload)
        // var objectToTest = JSON.parse(selctedNode.payload[loc])
        // if string can convert to json, then test for lat lon
        //set lat and lon
        // if (objectToTest["lat"] && objectToTest["lon"]){
        //   var geoObject = {};
     
        //   geoObject["lat"] = objectToTest.lat
        //   geoObject["lon"] = objectToTest.lon
        //   geoObject["type"] = selectedNode.type
        //   geoObject["label"] = selectedNode.label
        //   geoObject["field"] = loc
        //   geoObject["indexPattern"] = selectedNode.indexPattern
        //   geolist.push(geoObject)
        // }
        if (loc == "location"){
          // console.log(selectedNode.payload["location"])
           var geoObject = {};
          geoObject["location"] = selectedNode.payload["location"]
          geoObject["type"] = selectedNode.type
           geoObject["label"] = selectedNode.label
           geoObject["field"] = loc
          geoObject["indexPattern"] = selectedNode.indexPattern
                    geolist.push(geoObject)

        }
       
      // }
      // catch(error){}
    }
  }
  function findDatesInNodeRecord(selectedNode){
    var objectToExamine = selectedNode.payload;
    // search through payload for date field(s). If exists, create new object with properties"type", "label", and "date"
    for (var key in objectToExamine){

      var dateString = (objectToExamine[key])
      var d = new Date(dateString)
      if ((dateString[4] === "-") && (dateString[7] === "-") && (Date.parse(d) > 0)){
        // console.log(selectedNode)
        // console.log(key)

        var newObject = {};
        newObject["type"] = selectedNode.type;
        newObject["label"] = selectedNode.label;
        newObject["date"] = objectToExamine[key];
        newObject["indexPattern"] = selectedNode.indexPattern;
        newObject["field"] = key;
        newObject["nodeID"] = selectedNode.id;

        return newObject
      }
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
    console.log(graphModel)
    console.log(nodes)
    console.log("here")
    
    if (originNodes){
      for (originNode in originNodes){
        var color;
          var label = queryTypes[originNode]; // this is a data struct that maps each created node id to the type of query that generated it (types are time, geo, and eid)
          if (queryTypes[originNode] === "time"){color = "rgb(82, 255, 51)"} 
          else if (queryTypes[originNode] === "eid"){color = "rgb(255, 51, 240)"} 
           var manual = {};
            manual.id = "VE_-"+Math.floor(Math.random()*16777215).toString(16)
            manual.properties = {}
            manual.inV =  originNode// virt is the selected node, the origin of the edge
            manual.label = label
            manual.w = 1
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
    else{
    newNodes.forEach(function(virt){
    
     
        console.log("Shoulthis")
        nodes.forEach(function(node){
          var color;
          var label = queryTypes[node.id]; // this is a data struct that maps each created node id to the type of query that generated it (types are time, geo, and eid)
          console.log("lable" + queryTypes[node.id])
          if (queryTypes[node.id] === "time"){color = "rgb(82, 255, 51)"} 
          else if (queryTypes[node.id] === "eid"){color = "rgb(255, 51, 240)"} 
           
            var manual = {};
            manual.id = "VE_-"+Math.floor(Math.random()*16777215).toString(16)
            manual.properties = {}
            manual.inV = virt // virt is the selected node, the origin of the edge
            manual.label = label
            manual.w = 1
            manual.outV = node.id // this is the target node
            manual.type = "edge";
            manual.c = color;
            manual.direction = "both"
      
      
            edges.push(manual)
        })
      
    })
    }

    console.log(edges)
    return edges;
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
    // console.log(hits)
    var ids = [];
    for (var id in hits){
      var res = hits[id];
          var id = res._index + "/" + res._type + "/" + res._id;
      ids.push(id)
    }
    // console.log(ids)
    return ids;
  }

  function queryElasticSearch(index, query, graphModel, queryType, size, originNodeID){
      // for each index
      // console.log("exec: ")
      // console.log(query)
      // console.log(index)
      return f.executeEsSearch(index, "", query, size)
      .then(function (searchResults){
         console.log(searchResults)
         var resultAndType = {};
         resultAndType.type = queryType;
         console.log(originNodeID, "post es")
         resultAndType.originNodeID = originNodeID;
         resultAndType.result = searchResults;
        // sendToGraph(graphModel, extractIDs(searchResults.hits.hits))
          return Promise.resolve(resultAndType);
      });
  }



  
 function afterModalClosed(graphId, graphModel, graphSelection, onOkModalResult) {
    
  var selection = getNodesSelection(graphSelection, graphModel);
  var queryTemplate;
  // console.log(onOkModalResult)

  var constructQuery = new Promise(function(resolve, reject) {
    resolve(findCommonIndicesToSearch(selectionNodes, graphModel,readUserInputEID(), readUserInputTimeGeo(), readLimitResults()));
  });
    

  queryPromises = [];

  var queryTypes = [];
  var originNodes = [];

  return constructQuery.then(function(results){
      // console.log(results)
    
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
      console.log(results);
      
      var arrayofIDs = [];
      var resultType = results.type;

    
      // /**************************
      // * Create id from each node in result to send on to Gremlin query and get nodes to be placed on graph
      // * *************************/
      results.forEach(function(result){
        result.result.hits.hits.forEach(function(res){
          
          console.log(res)
          var id = res._index + "/" + res._type + "/" + res._id;
          queryTypes[id] = result.type;
          originNodes[id] = result.originNodeID;

          arrayofIDs.push(id)
      })
      })
      
      /*************** PLACE ALL ON GRAPH***************/
      var query = 'g.V($1)';
      // queryTemplate = 'g.V($1).bothE(' + relList + ').as("e").bothV().as("v").select("e","v").mapValues()';
      
    
      // console.log(query)
      return Promise.all([
        entityResToGraph(arrayofIDs, graphId, query)
        // ,
        // entityResToGraph(selection, graphId, queryTemplate)
      ])
      .then(function ([res1]) {
        
        console.log(res1)
        // console.log(graphSelection)
        // console.log(graphModel)
        // console.log(resultType)
        var edges = []
        var response = res1; // .concat(res2);
        // console.log(arrayofIDs.concat(selection))
        // console.log(queryTypes)
        
        var addedEdges = createEdges(response, graphSelection, queryTypes, originNodes, graphModel)
        
        response = response.concat(addedEdges)
        
        return f.addResultsToGraph(graphId, arrayofIDs.concat(selection), response)
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

var idsToBeAdded = [];

