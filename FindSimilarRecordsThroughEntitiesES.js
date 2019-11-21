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

  function getCount(graphId, newGraphSelection, relation) {
    var queryTemplate = 'g.V($1).bothE("' + relation.id  + '").count()';
    return f.executeGremlinQuery(graphId, queryTemplate, newGraphSelection)
    .then(function (responses) {
      var count = responses.reduce(function (acc, val) { return acc + val; }, 0);
      return {
        id: relation.id,
        label: relation.directLabel,
        count: count,
        rangeLabel: relation.range.label
      };
    })
    .catch(f.notify.error);
  }

  function beforeAll(graphId, graphModel, graphSelection) {
    // return f.getKibiRelations()
    // .then(function(relations){
    //   console.log(relations)
    // })
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

  function selectEntities(entityIdSet, newGraphSelection){
    f.getKibiRelations()
      .then(function (relations) {
        
        console.log(relations)
        var arrayOfPromises = [];
        
        // Filter relations
        // this set is to avoid showing bidirectional relations, as they would have the same count
        var bidirectionalRelation = new Set();
        _.each(relations, function (relation) {
          console.log(relation)
          console.log(lookup)

          if (entityIdSet.has(relation.domain.id) && relation.range.type == "VIRTUAL_ENTITY")  {
            if (relation.directLabel === relation.inverseLabel
              && !bidirectionalRelation.has(relation.directLabel)) {
              arrayOfPromises.push(getCount(graphId, newGraphSelection,  relation));
              bidirectionalRelation.add(relation.directLabel);
            } else if (relation.directLabel !== relation.inverseLabel) {
              arrayOfPromises.push(getCount(graphId, newGraphSelection,  relation));
            }
          }
        });
        return Promise.all(arrayOfPromises)
        .then(function (arrayOfResults) {
        
          entities = _.sortBy(arrayOfResults, 'label');
          var html = '<div>';
          if (newGraphSelection.length != 1){
            html = html + "Must select only 1 node";
          }
          else{
            entities.forEach(function (element) {
              if (element.count > 0){
                html = html + '<input type="checkbox" ng-model=\'relations["' + element.id + '"]\'> '
                  + element.label + ' (' + element.count + ')'
                  + '<span style=\'font-size:0.8em;font-style: italic\'>' + element.rangeLabel + '</span>'
                  + '</input></br>';
              }
              
            });
          }

          html = html + '</div>';
          f.openModal(graphId ,'Select the fields you want to base search on', html);

          return {
            model: null,
            selection: null
          };
        });//end Promise.all
      });
  }


  function getNodesSelection(graphSelection, graphModel) {
    var selection = [];
    if (!graphSelection || graphSelection.length === 0) {
      _.each(graphModel.nodes, function (node) {
        selection.push(node.id);
      });
    } else {
      var selectionSet = new Set(graphSelection);
      _.each(graphModel.nodes, function (node) {
        if (selectionSet.has(node.id)) {
          selectedNode = node;
          lookup = selectedNode.payload;
          console.log(selectedNode)
          selection.push(node.id);
        }
      });
    }

    return selection;
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

  /*******************************
   * THIS FUNCTION KICKS OFF THE MAIN PROCESS OF ESTABLISHING THE INDICES TO SEARCH, 
   * AND THE FIELDS WITHIN EACH INDEX. 
   * THE ES QUERIES ARE DYNAMICALLY CONSTRUCTED AND RUN, WITH THE TOP RESULTS BEING PLACED ON THE GRAPH.
   * 
   * THEN WE BUILD EDGES FROM NODE TO NODE, WITH BLUE EDGES REPRESENTING FULL MATCH, AND PINK REPRESENTING 
   * INEXACT MATCHES.
   */
  function afterModalClosed(graphId, graphModel, graphSelection, onOkModalResult) {
    
    var selection = getNodesSelection(graphSelection, graphModel);
    var queryTemplate;
    
    if (onOkModalResult && onOkModalResult.length) {
      var rels = JSON.stringify(onOkModalResult);
      var relList = rels.substring(1, rels.length - 1);
      
      
      /***** Here we filter down to the selected entities in the modal. Because it only passes id, and we need to
      ***** get all possible connections to entity by label */
      var filteredEntityLabels = entityConnections.filter(function(connection){
        return onOkModalResult.includes(connection.inverseOf);
      });
      
      
      var finalEntitiesToBeSearched = {};
      /* Loop through all possible entity connections and check domain and range to see if VIRTUAL_ENTITY, and if label matches */
      
      filteredEntityLabels.forEach(function(desiredLabel){
        entityConnections.forEach(function(entity){ // check 
          if (desiredLabel.domain.label === entity.domain.label){// we have a match of entity identifiers attached to index
              if(!finalEntitiesToBeSearched[entity.range.indexPattern]) finalEntitiesToBeSearched[entity.range.indexPattern] = [];
              finalEntitiesToBeSearched[entity.range.indexPattern].push(entity);
          } 
        })
      })
      
      var labelSwapPromises = [];
    Object.keys(finalEntitiesToBeSearched).forEach(key=>{
      finalEntitiesToBeSearched[key].forEach(function(entity){
        var query = {};
        query.query = {};
        query.query.match = {};
        query.query.match["_id"] = entity.range.indexPattern;
        var lsPromise = new Promise(function(resolve, reject) {
                resolve(queryLabelElasticSearch(".siren", query, graphModel));
        });
        labelSwapPromises.push(lsPromise)
      })
      
    })
    
    return Promise.all(labelSwapPromises)
    .then(function(results){
      console.log(results)
      results.forEach(function(result){
        console.log(result.hits.hits[0]["_id"])
        console.log(result.hits.hits[0]["_source"]["index-pattern"].title)
        idxLabels[result.hits.hits[0]["_id"]] = result.hits.hits[0]["_source"]["index-pattern"].title;
      })
      console.log(idxLabels)
      console.log(finalEntitiesToBeSearched)
      var queries = generateESQueries(finalEntitiesToBeSearched)
    var queryPromises = [];
    
    console.log(queries)
    
    Object.keys(queries).forEach(key=>{
      console.log(key)
      console.log(queries[key])
        var elasticSearchPromise = new Promise(function(resolve, reject) {
              resolve(queryElasticSearch(key, queries[key], graphModel));
      });
        queryPromises.push(elasticSearchPromise);
    })
      
    return Promise.all(queryPromises)
    .then(function(results){
      console.log(results);
      
      var arrayofIDs = [];
    
      // /**************************
      // * Create id from each node in result to send on to Gremlin query and get nodes to be placed on graph
      // * *************************/
      results.forEach(function(result){
        result.hits.hits.forEach(function(res){
          console.log(res)
          var id = res._index + "/" + res._type + "/" + res._id;
          arrayofIDs.push(id)
      })
      })
      
      /*************** PLACE ALL ON GRAPH***************/
      var query = 'g.V($1)';
      queryTemplate = 'g.V($1).bothE(' + relList + ').as("e").bothV().as("v").select("e","v").mapValues()';
      
    
      console.log(arrayofIDs)
      return Promise.all([
        entityResToGraph(arrayofIDs, graphId, query),
        entityResToGraph(selection, graphId, queryTemplate)
      ])
      .then(function ([res1, res2]) {
        
        console.log(res1)
        console.log(res2)
        var edges = []
        var response = res1.concat(res2);
        
        var virtualEntities = res2.filter(function(entity){
          return entity.id.includes("VIRTUAL_ENTITY")
        })
        
        var addedEdges = createEdges(res1, virtualEntities)
        
        response.forEach(function(linkNode){
                /*************************
              * For each result, build Links to Origin Node - Not Using this now, but will be
              * *********************/
              var linkPair = {
                    in: selectedNode.id,
                    out: linkNode.id
                };
                var nodeState = {
                    label: "is like ",
                    size: 5,
                    color: '#'+Math.floor(Math.random()*16777215).toString(16)
                  };
                  
              /*For Now we are creating links to Entity Identifiers*/
              var edge = createScriptedLink(linkPair, nodeState, linkNode.id, "out");
              edges.push(edge);
              
        })
        
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
      
    
    }
      
  }

  function createEdges(nodes, virtualEntities){
    var edges = [];
    
    virtualEntities.forEach(function(virt){
      console.log(virt)
      
      virt_id_f = virt.id.replace("VIRTUAL_ENTITY/", "")
      virt_id = virt_id_f.substr(0, virt_id_f.indexOf("/"));
      ei_name = virt_id_f.substr(virt_id_f.indexOf("/")+1).replace("+", " ");
      console.log(ei_name)
  
    nodes.forEach(function(node){
      console.log(node)
      console.log(fields[ei_name])
      console.log(node.properties[fields[ei_name]][0].value)
      var manual = {};
        manual.id = "VE_-"+Math.floor(Math.random()*16777215).toString(16)
        manual.properties = {}
        manual.inV = virt.id
        manual.inVLabel = node.properties[fields[ei_name]][0].value
        manual.label = node.properties[fields[ei_name]][0].value
        manual.w = 1
        manual.outV = node.id
        manual.outVLabel = node.properties[fields[ei_name]][0].value
        manual.type = "edge";
        manual.c = 'rgb(255,153,255)'
        
        /* We check if our node is an exact match with the selected node, if it is, we don't add it to the graph
        /* as it will already be added 
        */
        var pushable = true;
        console.log(fields)
        
          if (node.properties[fields[ei_name]][0].value != lookup[fields[ei_name]]){
            console.log(manual)
            edges.push(manual)
          } 
          
        })
    })

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

  function queryElasticSearch(index, query, graphModel){
      // for each index
      console.log("exec: ")
      console.log(query)
      return f.executeEsSearch(idxLabels[index], "", query, 5)
      .then(function (searchResults){
          return Promise.resolve(searchResults);
      });
  }

  function generateESQueries(entitiesGrouped){
    var esQueries = {};
    
    Object.keys(entitiesGrouped).forEach(key=>{
      entitiesGrouped[key].forEach(function(entity){
      console.log(entity)
      entity.range.field = entity.range.field.replace('.keyword','');
      if (queryText == undefined) queryText = lookup[entity.range.field];
      console.log(queryText)
      });
    });
    console.log(queryText);    
    Object.keys(entitiesGrouped).forEach(key=>{
      console.log(entitiesGrouped[key])
      var dynamicQuery = {};
      dynamicQuery.query = {};
      dynamicQuery.query.bool = {};
      dynamicQuery.query.bool.must = [];
      //dynamicQuery.query.bool.must.match = {};
      
      
      
      
      entitiesGrouped[key].forEach(function(entity){
        entity.range.field = entity.range.field.replace('.keyword','');
        console.log(queryText)
        // add keys to a list so we know what fields we are searching and have a ref to them globally
        fields[lookup[entity.range.field]] = entity.range.field;
        var fuzzy = {};
        fuzzy.match = {};
        fuzzy.match[entity.range.field] = {};
        fuzzy.match[entity.range.field].query = queryText;
        fuzzy.match[entity.range.field].boost = 1;
        fuzzy.match[entity.range.field].fuzziness = "AUTO";
        fuzzy.match[entity.range.field].operator = "OR";
        fuzzy.match[entity.range.field].prefix_length = 0;
        fuzzy.match[entity.range.field].max_expansions = 50;
        fuzzy.match[entity.range.field].fuzzy_transpositions = true;
        fuzzy.match[entity.range.field].lenient = true;
        fuzzy.match[entity.range.field].zero_terms_query = "ALL";
        
        dynamicQuery.query.bool.must.push(fuzzy);
      })
      console.log("ES query: ");
      console.log(JSON.stringify(dynamicQuery));
      esQueries[key] = dynamicQuery;
    });
    
    // Returns queries in an object where key is the label of index to be searched
    return esQueries;
  }
  
  // {
  //   "query":{
  //     "bool":{"must":[{"fuzzy":{"about":{"value":"","boost":1,"fuzziness":2}}}]}}}

  // {
  //   "query" : {
  //     "bool" : {
  //       "must" : [
  //         {
  //           "match" : {
  //             "text" : {
  //               "query" : "",
  //               "operator" : "OR",
  //               "fuzziness" : "AUTO",
  //               "prefix_length" : 0,
  //               "max_expansions" : 50,
  //               "fuzzy_transpositions" : true,
  //               "lenient" : true,
  //               "zero_terms_query" : "ALL",
  //               "boost" : 1.0
  //             }
  //           }
  //         }
  //       ],
  //       "adjust_pure_negative" : true,
  //       "boost" : 1.0
  //     }
  //   }
  // }










  /************************************************
  **********************************************
  ***** CURRENTLY UNUSED BUT COULD BE USEFUL LATER 
  * *******************************************
  * *********************************************/

  function sendToGraph (graphModel, arrayOfIDs){
    /*****************
          * Get Graph Nodes
          * ***/
          console.log(arrayOfIDs)
          var queryList = 'g.V($1)';
        
            return f.executeGremlinQueryAndParse(graphId, queryList, arrayOfIDs)
            .then(function(response){
                                console.log(response)
                                console.log(selectedNode)
              response.forEach(function(linkNode){
                /*************************
              * For each result, build Links to Origin Node
              * *********************/
              var linkPair = {
                    in: selectedNode.id,
                    out: linkNode.id
                };
                var nodeState = {
                    label: "is like ",
                    size: 5,
                    color: '#'+Math.floor(Math.random()*16777215).toString(16)
                  };
                  
              var edge = createScriptedLink(linkPair, nodeState, linkNode.id, "out");
              
              graphModel.relations.push(edge);
              

              })
              graphModel.nodes = graphModel.nodes.concat(response);
              console.log(graphModel)
              
              return {
                model: graphModel,
                relayout: true
              }
              
            })
  }

  /**********************
  * Having our center node, and our related nodes, we must then retrieve our Links/Edges
  * *******************/
  function createScriptedLink(linkPair, nodeState, nodeId, direction) {
    var newLink = {
      id: hashCode(linkPair.in + linkPair.out + nodeId),
      direction: direction,
      in: linkPair.in,
      out: linkPair.out,
      volatile: true
    };
    _.each(nodeState, function (value, key) {
      newLink[key] = value;
    });
    return newLink;
  }

  function hashCode(s){
    return 'ASSOCIATED_EDGE-'+ s.split('').reduce(function(a,b){a=((a<<5)-a)+b.charCodeAt(0);return a&a},0);
  }
