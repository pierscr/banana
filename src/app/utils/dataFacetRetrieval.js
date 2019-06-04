define('dataFacetRetrieval',[],function(){

  return function(facetList,$scope,dashboard,filterSrv,querySrv,callback){

    // Show the spinning wheel icon
    $scope.panelMeta.loading = true;
    $scope.panel.max_number_r || ($scope.panel.max_number_r=30);

    // Set Solr server
    $scope.sjs.client.server(dashboard.current.solr.server + dashboard.current.solr.core_name);
    var request = $scope.sjs.Request();

    // Construct Solr query
    var fq = '';
    if (filterSrv.getSolrFq()) {
        fq = '&' + filterSrv.getSolrFq();
    }
    var wt = '&wt=json';
    var rows_limit = '&rows=' +$scope.panel.max_number_r;


    var createFacetNode=function(list,object,aggregation_function){
      field=list.pop()
      object.facet || (object.facet={});
      object.facet[field]={
        type:"terms",
        field:field,
        limit:$scope.panel.max_number_r
      }
      if(aggregation_function!="count" && aggregation_function!=undefined){
        aggregation_function:"avg",
        object.facet[field].facet={};
        object.facet[field].facet[$scope.panel.bubbleSizeField]=aggregation_function+"("+$scope.panel.bubbleSizeField+")";
      }
      !list.length || createFacetNode(list,object.facet[field],aggregation_function);
      object.allBuckets = true;
      object.numBuckets = true;
    };
    var json_facet={};

    createFacetNode(facetList.reverse(),json_facet,$scope.panel.agg_function_);

    var pivot_field="&facet=true&json.facet="+JSON.stringify(json_facet.facet);
    var clusterSubset="&fq=(dim_s:"+$scope.panel.xaxis+" || dim_s:"+$scope.panel.yaxis+")"

    $scope.panel.queries.query = querySrv.getQuery(0) + fq + pivot_field + wt + rows_limit+clusterSubset;


    // Set the additional custom query
    if ($scope.panel.queries.custom != null) {
        request = request.setQuery($scope.panel.queries.query + $scope.panel.queries.custom);
    } else {
        request = request.setQuery($scope.panel.queries.query);
    }



    // Execute the search and get results
    var results = request.doSearch();

    results.then(function(results) {
      callback(results);
    });


}
});
