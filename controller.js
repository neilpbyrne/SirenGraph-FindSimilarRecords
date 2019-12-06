var rangeSlider = function(){
    var slider = $('.range-slider'),
        range = $('.range-slider__range'),
        value = $('.range-slider__value');
      
    slider.each(function(){
  
      value.each(function(){
        var value = $(this).prev().attr('value');
        $(this).html(value);
      });
  
      range.on('input', function(){
        $(this).next(value).html(this.value);
      });
    });
  };

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

    console.log(fuzzy)

    return fuzzy;
  }
  
  function constructMoreLikeThisQuery(originalId, fieldsToCompare, indexToCompare, type){
    var moreLikeThis = {};
    // moreLikeThis.size = 5;
    // moreLikeThis.query = {};
    moreLikeThis.more_like_this = {};
    moreLikeThis.more_like_this.min_term_freq = 1;
    moreLikeThis.more_like_this.min_doc_freq = 1;
    moreLikeThis.more_like_this.fields = [];
    for (field in fieldsToCompare){
      moreLikeThis.more_like_this.fields.push(fieldsToCompare[field]);
    }

    moreLikeThis.more_like_this.like = {};
    moreLikeThis.more_like_this.like._index = indexToCompare;
    moreLikeThis.more_like_this.like._type = type;
    moreLikeThis.more_like_this.like._id = originalId;

    console.log(moreLikeThis)

    return moreLikeThis;
  }

  function constructGeoProximityQuery(point, distance, field){
    console.log(point)
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
  
    console.log(JSON.stringify(geoprox))
  
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
  
    console.log(JSON.stringify(rangeQuery))
  
    return rangeQuery;
  }

  function constructCompoundQuery(eids, timeQuery, geoQuery){
    var query = {};
    query.query = {};
    query.query.bool = {}
    query.query.bool.must = [];
    if (timeQuery) query.query.bool.must.push(constructTimeRangeQuery("founded_date", "2090-01-01", "2000-01-01"))
    // if (geoQuery) query.query.bool.must.push(constructGeoProximityQuery({"lon":"-96.20", "lat":"44.20"}, "800km", "location"))

    console.log(eids)
    for(eid in eids){
      console.log(eids[eid])
      if (eids[eid].mlt) query.query.bool.must.push(constructMoreLikeThisQuery("RmCJZG4BFquVIwfewy1n", ["overview"], "company", "Company"))
      else if (eids[eid].fuzzy) query.query.bool.must.push(constructFuzzyQuery("creative communications and production", "overview"))
      // else if (eid.match) query.query.bool.must.push(constructMatchQuery())
    }

    console.log(JSON.stringify(query));
    return JSON.stringify(query);
  }
  