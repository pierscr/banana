define('dataRetrieval',['angular'],function(angular){
      'use strict';
      return function($scope,dashboard,$injQ,filterSrv){
        var $injQ;
        // angular.injector(['ng']).invoke(['$q', function($q) {
        //           $injQ=$q;
        //         }]);
          dashboard;

          function createRequest(){


            var yearsCostraint="";

            function getNodes(nodeList,deactiveGlobalFilter,callback){
              var filters="";
              $scope.sjs.client.server(dashboard.current.solr.server + $scope.panel.nodesCore);
              var nodeFilter="&wt=json&facet=true&facet.pivot="+$scope.panel.nodesField+"&q=*:*&rows=0&facet.limit="+ $scope.panel.max_rows;
              var separator=function(index){
                return 0===index?"\"":" OR \"";
              };
              if(nodeList!==undefined){
                filters+="&fq="+$scope.panel.nodesField+":"+nodeList.reduce(function(tot,curr,index, arr){return tot+separator(index)+callback(curr)+"\"";},"(")+")";
              }
              if(!deactiveGlobalFilter){
                filters += filterSrv.getSolrFq(false,"cluste_h")!==''?'&' + filterSrv.getSolrFq(false,"cluste_h"):'';
              }
              return $scope.sjs.Request()
                  .setQuery(nodeFilter+filters+yearsCostraint)
                  .doSearch();
            }

            function getGridStep(nodeList){
              var deferred = $injQ.defer();
              $scope.sjs.client.server(dashboard.current.solr.server + $scope.panel.linksCore);
              //var join="&q={!join from="+$scope.panel.nodesField+" to=Cluster2 fromIndex="+$scope.panel.nodesCore+"}*:*"
              var q="&q=*:*";
              var nodeFilter="&wt=json&fq=Cluster1:\""+nodeList[0].value+"\"&rows=500";
              var stepResults={stepNodes:[],selfNode:[],links:[],stepNodesResponse:false,selfNodeResponse:false};
              function semaphore(){
                if(stepResults.stepNodesResponse && stepResults.selfNodeResponse){
                  var nodes=stepResults.selfNode.length>0?stepResults.selfNode.concat(stepResults.stepNodes):stepResults.stepNodes;
                  deferred.resolve({nodes:nodes,links:stepResults.links});
                }
              };

              $scope.sjs.Request()
                  .setQuery(nodeFilter+q)
                  .doSearch()
                  .then(function(results){
                      stepResults.links=results.response.docs;
                      getNodes(stepResults.links,true,function(item){
                          return item.Cluster2;
                      })
                      .then(function(results){
                          //$scope.myGrid.addNode(results.facet_counts.facet_pivot['"+$scope.panel.nodesField+"'].map(function(item){ item.year=range.getRange(0);return item;}));
                          stepResults.stepNodes=results.facet_counts.facet_pivot[$scope.panel.nodesField];
                          stepResults.stepNodesResponse=true;
                          semaphore();
                          //deferred.resolve({nodes:results.facet_counts.facet_pivot['cluster_h'],links:links});
                      });
                      getNodes(nodeList,true,function(item){
                          return item.value;
                      })
                      .then(function(results){
                          //$scope.myGrid.addNode(results.facet_counts.facet_pivot['cluster_h'].map(function(item){ item.year=range.getRange(0);return item;}));
                          stepResults.selfNode=results.facet_counts.facet_pivot[$scope.panel.nodesField];
                          stepResults.selfNode.map(function(item){item.myself=true;return item;})
                          stepResults.selfNodeResponse=true;
                          semaphore();
                          //deferred.resolve({nodes:results.facet_counts.facet_pivot['cluster_h'],links:links});
                      });
                  });


              return deferred.promise;
              // criterio
              //  .addFq('Cluster1',clusterList);
              //  .addFilterByJoin('nodesCollection')
              //  .addFacet('Cluster2');
              // dataSource
              //      .createRequest()
              //      .selectLinkCollection()
              //      .addCriterio(criterio)
              //      .query(funciton(result){
              //          $scope.myGrid.grid.addLinks(result.getDocuments());
              //          criterio.fq('cluster_h',result.getFacet('Cluster2'));
              //          criterio.fq('year',__TODO__);
              //          dataSource.getNodes(criterio)
              //          .then(function(nodes){
              //            $scope.myGrid.addNode(nodes);
              //            $scope.emit('render');
              //          })
              //      });
            }

            function addYearsCostraint(years){
              if(years.length===1){
                yearsCostraint="&fq=year:"+years[0];
              }else{
                yearsCostraint="&fq=year:["+years[0]+" TO "+years[1]+"]";
              }
              return this;
            }

            return {
              addYearsCostraint:addYearsCostraint,
              getNodes:getNodes,
              getGridStep:getGridStep
            };

          }


          return {
            createRequest:createRequest
          };
    };
});
