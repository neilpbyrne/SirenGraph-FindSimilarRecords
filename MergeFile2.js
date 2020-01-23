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
  
  

  function getCount(graphId, newGraphSelection, relation) {
    var queryTemplate = 'g.V($1).bothE("' + relation.id  + '").count()';
    return f.executeGremlinQuery(graphId, queryTemplate, newGraphSelection)
    .then(function (responses) {
      // console.log(responses)
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
    console.log(graphSelection)
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
    console.log(id)
    for (var n in nodes){
      console.log(nodes[n])
      if (id === nodes[n].entityId) return true;
    }
    return false;
  }

    var commonEIDs = []


  function selectEntities(entityIdSet, newGraphSelection){
    f.getKibiRelations()
      .then(function (relations) {
        
        var arrayOfPromises = [];
        
        commonEIDs = []
        var eidCounts = {};
        var nodeTypesSelected = new Set();

       selectionNodes.forEach(function(ent){
         console.log(ent)
         console.log(ent["id"].substr(0, ent["id"].indexOf('/')))
         console.log(ent["id"].substr(0,3))
          if (ent["id"].substr(0, ent["id"].indexOf('/')) !== "VIRTUAL_ENTITY") nodeTypesSelected.add(ent["id"].substr(0, ent["id"].indexOf('/')));
         // if (ent.substr(0,4) === "eid:") eids++
        })
        console.log(selectionNodes)
       
        
        // Filter relations
        // this set is to avoid showing bidirectional relations, as they would have the same count
        var bidirectionalRelation = new Set();
        _.each(relations, function (relation) {

          if (entityIdSet.has(relation.domain.id) && relation.range.type == "VIRTUAL_ENTITY")  {
                     

            //We count the amount of node relations that link to this eid, if = #nodes selected then it is common eid and can be used
            if (checkIfDomainNodeExists(relation.domain.id, selectionNodes)){
              if (!eidCounts[relation.range.label]) eidCounts[relation.range.label] = 0;
              console.log(relation.range)
              eidCounts[relation.range.label]++;
            }
            
            
            
            if (relation.directLabel === relation.inverseLabel
              && !bidirectionalRelation.has(relation.directLabel)) {
              
              arrayOfPromises.push(getCount(graphId, newGraphSelection,  relation));
              bidirectionalRelation.add(relation.directLabel);
            } else if (relation.directLabel !== relation.inverseLabel) {
             
              arrayOfPromises.push(getCount(graphId, newGraphSelection,  relation));
            }
          }
        });
        console.log(eidCounts)
      Object.keys(eidCounts).forEach(function(selection){
        if (eidCounts[selection] === nodeTypesSelected.size){
          commonEIDs.push(selection)
        }
      })
      
      console.log(commonEIDs)
        
        return Promise.all(arrayOfPromises)
        .then(function (arrayOfResults) {
          
      
        
          entities = _.sortBy(arrayOfResults, 'label');
          var html = '<div>';
          
            commonEIDs.forEach(function (element) {
  
                miniHtml += '<div class="grid-row"> <div class="flex-item">'+element+'</div><label class="flex-item"> <input type="radio" value="ignore" name="'+element+'" checked> <span></span> </label> <label class="flex-item"> <input type="radio" value="exact" name="'+element+'"> <span></span> </label> <label class="flex-item"> <input type="radio" value="fuzzy" name="'+element+'"> <span></span> </label> <label class="flex-item"> <input type="radio" value="mlt" name="'+element+'"> <span></span> </label> <label class="flex-item"> <div class="slider boost"><input class="inp" id="'+element+'Boost" type="number" value="1" min="1" max="5">'
                // CODE FOR BOOST SLIDER
                // <div class="range-slider"> <input class="range-slider__range" type="range" value="1" min="1" max="4"> <span class="range-slider__value">1</span> </div>'
                  // slider.each(function(){
                  //       value.each(function(){
                  //         var value = $(this).prev().attr('value');
                  //         $(this).html(value);
                  //       });
                    
                  //       range.on('input', function(){
                  //         $(this).next(value).html(this.value);
                  //       });
                  //     });
                  
                  miniHtml += '</div></label> </div>'
                      
                // html = html + '<input type="checkbox" ng-model=\'relations["' + element.id + '"]\'> '
                //   + element.label + ' (' + element.count + ')'
                //   + '<span style=\'font-size:0.8em;font-style: italic\'>' + element.rangeLabel + '</span>'

              
            });
            
            // Html for Time, Geo, and # of Records
            // Time Field - Check if we have time records, if so, add to dropdown list
            if(datelist.length>0){
                miniHtml += '<div class="grid-row"> <div class="selecter" style="float:left; width: 30%;"> <label> <input type="checkbox" value="time" name="time"> <span>Time Filter</span> </label> </div><div class="slider time"> <div class="time dropdown" style="float: left;">'
                miniHtml += '<select id = "time_select"> <option value="" selected disabled hidden>Choose here</option>'
                for (date in datelist){ 
                 miniHtml += '<option value="'+date +'">'+ datelist[date].type  +'  -  '+ datelist[date].label  +'  -   '+ datelist[date].date  +'</option>'
               }
               miniHtml += '</select> </div><div class="range-slider"> <input class="time_days inp" type="text" value="0" min="0" max="5000"><div style="float: left;margin: 5px;">days</div><input class="inp time_months" type="text" value="0" min="0" max="5000"><div style="float: left;margin: 5px;">mths</div><input class="inp time_years" type="text" value="0" min="0" max="5000"><div style="float: left;margin: 5px;">yrs</div></div></div></div>'
              }
              
              if(geolist.length>0){
               miniHtml += '<div class="grid-row"> <div class="selecter" style="float:left; width: 30%;"> <label> <input type="checkbox" value="geo" name="geo"> <span>Geo Filter</span> </label> </div><div class="slider geo" style="float: left;"> <div class="geo dropdown" style="float: left;">'
               miniHtml += '<select id="geo_select"> <option value="" selected disabled hidden>Choose here</option>' 
               for (geo in geolist){
                miniHtml += '<option value="'+geo +'">'+ geolist[geo].type  +'  -  '+ geolist[geo].label  +'  -   '+ geolist[geo].lat  +' -   '+ geolist[geo].lon  +'</option>' 
               }
               miniHtml += '</select> </div><div class="range-slider"> <input class="geo_metres inp " type="text" value="0" min="0" max="5000"><div style="float: left;margin: 5px;">m</div><input class="inp geo_km" type="text" value="0" min="0" max="5000"><div style="float: left;margin: 5px;">km</div></div></div></div>'
              }
              miniHtml += '<div class="grid-row"> <div class="selecter" style="float:left; width: 30%;"> <label> <input type="checkbox" value="impact" name="consult-sig-sme"> <span>Limit Results</span> </label> </div><div class="slider limit"> <input id="limitResults" type="number" value="1" min="1" max="50"></div></div> </div></div></fieldset>';
                      

          // html = html + '</div>';
          html = miniHtml;
          f.openModal(graphId ,'Select the fields you want to base search on', html);
          

          return {
            model: null,
            selection: null
          };
        });//end Promise.all
      });
  }

function readLimitResults(){
  
    //eids = [];
    var limitObject = {};
    limitObject["limitResults"] = $('#'+"limitResults").val()
    console.log(limitObject)
    //eidSelection["action"] = $("input[name='"+commonEIDs[i]+"']:checked").val()
    //eids = limitObject
  
  //console.log(eids)
  
}

function readUserInputTimeGeo(){
    var eids = [];
    // eids["time"] = $('#time_select option:selected').text()
    // eids["geo"] = $("#geo_select option:selected").text()
    //console.log($('#time_select').val())
    //console.log($("#geo_select").val())
    var timeObject = {}
    var geoObject = {}
    timeObject["dateDropdown"] = datelist[$('#time_select').val()]
    timeObject["days"] = $('.time_days').val()
    timeObject["months"] = $('.time_months').val()
    timeObject["years"] = $('.time_years').val()
    
    geoObject["geoDropdown"] = geolist[$("#geo_select").val()]
    geoObject["metres"] = $('.geo_metres').val()
    geoObject["km"] = $('.geo_km').val()
    eids["time"] = timeObject
    eids["geo"] = geoObject
    console.log(eids)
  }

var selectionNodes = [];
var datelist = []
var geolist = []

function readUserInputEID(){
  
  eids = [];
  for (var i = 0; i < commonEIDs.length; i++) {
    var eidSelection = {}
    eidSelection["boost"] = $('#'+commonEIDs[i]+"Boost").val()
    eidSelection["action"] = $("input[name='"+commonEIDs[i]+"']:checked").val()
    eids[commonEIDs[i]] = eidSelection
  }
  
  console.log(eids)
  
}

  function getNodesSelection(graphSelection, graphModel) {
    console.log(graphSelection)
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
    
    console.log(selection)

    return selection;
  }

  function checkForLatLon(objectToTest, type, label){
    if (objectToTest["lat"] && objectToTest["lon"]){
       //set lat and lon
       var geoObject = {};
     
     geoObject["lat"] = objectToTest.lat
     geoObject["lon"] = objectToTest.lon
     geoObject["type"] = type
     geoObject["label"] = label
     //console.log(geoObject)
     geolist.push(geoObject)
     }
     else if (objectToTest["lat"] && objectToTest["long"]){
       //set lat and lon
       var geoObject = {};
  
     geoObject["lat"] = objectToTest.lat
     geoObject["lon"] = objectToTest.long
     geoObject["type"] = type
     geoObject["label"] = label
     //console.log(geoObject)
     geolist.push(geoObject)
     }
     else if (objectToTest["lat"] && objectToTest["lng"]){
       //set lat and lon
       var geoObject = {};
  
     geoObject["lat"] = objectToTest.lat
     geoObject["lon"] = objectToTest.lng
     geoObject["type"] = type
     geoObject["label"] = label
     //console.log(geoObject)
     geolist.push(geoObject)
     }
     else if (objectToTest["latitude"] && objectToTest["longitude"]){
       //set lat and lon
       var geoObject = {};
     
     geoObject["lat"] = objectToTest.latitude
     geoObject["lon"] = objectToTest.longitude
     geoObject["type"] = type
     geoObject["label"] = label
     //console.log(geoObject)
     geolist.push(geoObject)
     }
     /*else if (objectToTest["x"] && objectToTest["y"]){
       //set lat and lon
       var geoObject = {};
     
     
     geoObject["lat"] = objectToTest.x
     geoObject["lon"] = objectToTest.y
     geoObject["type"] = type
     geoObject["label"] = label
     console.log(geoObject)
     geolist.push(geoObject)
     }*/
     findSubObjects(objectToTest, type, label)
  }
  
  function findSubObjects(objectToTest,type,label){
       //recusively search within each object branch to see if a geopoint exists
       
       for (var key in objectToTest){
         //test to see if property is object, if so, test for lat lon
        if (objectToTest[key] instanceof Object){
           checkForLatLon(objectToTest[key], type, label)
           
        }
       }
  }

 function findGeoInNodeRecord(selectedNode){
     console.log(selectedNode)
     if(checkForLatLon(selectedNode, selectedNode.type, selectedNode.label)){
       return 
     }
     
     //console.log(geoObject)
     //return geoObject
    
 }
  
  function findDatesInNodeRecord(selectedNode){
    var objectToExamine = selectedNode.payload;
    //var objectType = selectedNode.type
    //console.log(selectedNode.label)
    
    // search through payload for date field(s). If exists, create new object with properties"type", "label", and "date"
    for (var key in objectToExamine){
      //console.log(objectToExamine[key])
      //if(objectToExamine[key] instanceof Date){
      var dateString = (objectToExamine[key])
      var d = new Date(dateString)
      if ((dateString[4] === "-") && (dateString[7] === "-") && (Date.parse(d) > 0)){
        //console.log(objectToExamine[key])
        var newObject = {};
        newObject["type"] = selectedNode.type
        newObject["label"] = selectedNode.label
        newObject["date"] = objectToExamine[key]
        //console.log(newObject)
        return newObject
      }
   }
  }
  
  

  function onModalOk(scope, graphModel) {
    readUserInputEID();
    readUserInputTimeGeo();
    readLimitResults();
    
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