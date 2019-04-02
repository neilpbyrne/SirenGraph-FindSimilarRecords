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
  return f.getInvestigateEntities()
  .then(function (entities) {
       
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
    
      lookup = selectedNode.payload;
                      
      var esAllIndex = {}
      var arrayofIDs = [];
      
      /**************************
      * Run ES Fuzzy query to return Similar Nodes
      * **********************/
       
      var entityCount = 0;
      
      console.log(graphModel.relations)

      
   
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
      
      var arrayOfPromises = [];
      
      // Filter relations
      // this set is to avoid showing bidirectional relations, as they would have the same count
      var bidirectionalRelation = new Set();
      _.each(relations, function (relation) {

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
            
              html = html + '<input type="checkbox" ng-model=\'relations["' + element.id + '"]\'> '
                + element.label + ' (' + element.count + ')'
                + '<span style=\'font-size:0.8em;font-style: italic\'>' + element.rangeLabel + '</span>'
                + '</input></br>';
            
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

function afterModalClosed(graphId, graphModel, graphSelection, onOkModalResult) {
  
  var selection = getNodesSelection(graphSelection, graphModel);
 
  var queryTemplate;
  
  console.log(onOkModalResult)
  
  if (onOkModalResult && onOkModalResult.length) {
    var rels = JSON.stringify(onOkModalResult);
    var relList = rels.substring(1, rels.length - 1);
    
    
    /***** Here we filter down to the selected entities in the modal. Because it only passes id, and we need to
    ***** get all possible connections to entity by label */
    var filteredEntityLabels = entityConnections.filter(function(connection){
      return onOkModalResult.includes(connection.inverseOf);
    });
    
    
    var finalEntitiesToBeSearched = [];
    /* Loop through all possible entity connections and check domain and range to see if VIRTUAL_ENTITY, and if label matches */
    
    filteredEntityLabels.forEach(function(desiredLabel){
      entityConnections.forEach(function(entity){ // check 
        if (desiredLabel.domain.label === entity.domain.label){// we have a match of entity identifiers attached to index
            var elasticSearchPromise = new Promise(function(resolve, reject) {
            resolve(queryElasticSearch(entity, graphModel));
            });
            finalEntitiesToBeSearched.push(elasticSearchPromise);
        } 
      })
    })
     
    console.log(relList)
     
    queryTemplate = 'g.V($1).bothE(' + relList + ').as("e").bothV().as("v").select("e","v").mapValues()';
  } else {
    queryTemplate = 'g.V($1)';
  }
     
  return Promise.all(finalEntitiesToBeSearched)
  .then(function(results){
    console.log(results);
     
    var arrayofIDs = [];
  
    // /**************************
    // * Create id from each node in result to send on to Gremlin query and get nodes to be placed on graph
    // * *************************/
    results.forEach(function(result){
      result.hits.hits.forEach(function(res){
        var id = res._index + "/" + res._type + "/" + res._id;
       
      //   var nodePromise = new Promise(function(resolve, reject) {
      //     resolve(entityResToGraph(id, graphId, queryTemplate));
      // })
      console.log("List of ids: ")
      console.log(id)
        // arrayofIDs.push(nodePromise);
        arrayofIDs.push(id)
    })
    })
    
    /*************** PLACE ALL ON GRAPH***************/
    var query = 'g.V($1)';
    queryTemplate = 'g.V($1).bothE(' + relList + ').as("e").bothV().as("v").select("e","v").mapValues()';
    
    /*var gPromises = [];
    
  
    var entityPromise = new Promise(function(resolve, reject) {
          entityResToGraph(selection, graphId, queryTemplate);
    })
    var nodePromise = new Promise(function(resolve, reject) {
          entityResToGraph(arrayofIDs, graphId, query);
    })
    gPromises.push(nodePromise)
    gPromises.push(entityPromise)*/
    
    // return Promise.all(gPromises)
    // .then(function(results){
    return Promise.all([
      entityResToGraph(arrayofIDs, graphId, query),
      entityResToGraph(selection, graphId, queryTemplate)
    ])
    .then(function ([res1, res2]) {
      
      console.log(res2)
      var edges = []
      var response = res1.concat(res2);
      
      var manual = {};
      manual.id = "VE_-1852138745"
      manual.properties = {}
      manual.inV = "VIRTUAL_ENTITY/194849f0-4a39-11e9-bdd1-731060d3052f/Pucket"
      manual.inVLabel = "194849f0-4a39-11e9-bdd1-731060d3052f"
      manual.label = "Suspect Last Name"
      manual.outV = ".le-persons-e9b7ea11-4efc-11e9-85e8-d24ab20adaa2/doc/13923"
      manual.outVLabel = "doc"
      manual.type = "edge"
      
      console.log(response)
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
            
            edges.push(edge);
            
      })
      
      
      response = response.concat(manual)
      console.log(response)
      return f.addResultsToGraph(graphId, arrayofIDs.concat(selection), response);

      /*return f.addResultsToGraph(graphId, arrayofIDs, res1)
      .then(function () {
        return f.addResultsToGraph(graphId, selection, res2)
      });*/
      /*
      graphModel.nodes = graphModel.nodes.concat(res1);
      console.log(res1)
      console.log(res2)
      
      res2.forEach(function(result){
        if (!result.id.includes("/")){
          graphModel.relations.push(result);
        }
        else{
          graphModel.nodes.push(result);
        }
      })
      
      console.log(graphModel)
      return {
        model: graphModel,
        relayout: true
      };*/
    })
      
    
    /************ THIS is the old method of addign to graph ******/
     // return sendToGraph(graphModel, arrayofIDs);
     
    // var relationsSet = new Set(onOkModalResult);
    //   console.log(selectedNode)
    //     console.log(queryTemplate)
      // return f.executeGremlinQuery(graphId, queryTemplate, selection)
      // .then(function (results) {
      //   console.log(results);
      //   return f.addResultsToGraph(graphId, selection, results);
      // });
  })
  .catch(function(error){
    console.log(error)
  })
     
    /******************* THIS IS THE FINAL LIST OF ENTITIES from which we will search  corresponding inices ***********/
    //console.log(finalEntitiesToBeSearched)
     
    /** NOW WE BUILD OUR ELASTICSEARCH QUERY/QUERIES***/
    
}

function entityResToGraph(selection, graphId, queryTemplate){
        return f.executeGremlinQuery(graphId, queryTemplate, selection)
        //.then(function (results) {
        //  console.log(results);
          //f.addResultsToGraph(graphId, selection, results)
          
       //   return results;
        
        //})
      
}

function queryElasticSearch(entity, graphModel){
  console.log(entity)
  /******************* AT THE MOMENT THIS LOOP BREAKS THE GRAPH PLOT. HAVE TO LOOK INTO****/
   
  // var esFuzzyBody = {
  //                         "query": {
  //                           "bool":{
  //                             "should":[{"fuzzy": {
  //                                 "SURNAME": {
  //                                   "value": lookup.SURNAME,
  //                                   "fuzziness": "AUTO"
  //                                   , "boost": 1.3
  //                                 }
  //                               }
  //                             },
  //                             {
  //                               "fuzzy": {
  //                                 "GIVENNAME": {
  //                                   "value": lookup.GIVENNAME,
  //                                   "fuzziness": "AUTO",
  //                                   "boost": 1.2
  //                                 }
  //                               }
  //                               }
  //                             ]
  //                           }
  //                         }
  //                       };
  var esFuzzyBody = 
  {
  "query": {
      "fuzzy": {
        "SURNAME" : {
            "value": "Pucket",
            "fuzziness": "AUTO"
          }
        }
      }
  } //entity.range.field


    // for each index
    return f.executeEsSearch(entity.range.label, "doc", esFuzzyBody, 3)
    .then(function (searchResults){
      console.log(searchResults)
      
      // var arrayofIDs = [];
    
      // /**************************
      // * Create id from each node in result to send on to Gremlin query and get nodes to be placed on graph
      // * *************************/
      // searchResults.hits.hits.forEach(function(result){
      //   var id = result._index + "/" + result._type + "/" + result._id;
      //   arrayofIDs.push(id);
      // });
     
      //  console.log("YES")
        //console.log(arrayofIDs)
        
        return Promise.resolve(searchResults);
      // return sendToGraph(graphModel, arrayofIDs);
      
      
      //remove link to self
      // arrayofIDs = arrayofIDs.filter(function(entry){
      //   return entry.id != selectedNode.id;
      // })
      
      
        
        
    });
}
