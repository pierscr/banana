define('dataRetrieval',['angular','d3'],function(angular,d3){
      'use strict';
      return function($scope,dashboard,$injQ,filterSrv){
        var $injQ;
        // angular.injector(['ng']).invoke(['$q', function($q) {
        //           $injQ=$q;
        //         }]);
          dashboard;

          function createRequest(){


            var yearsCostraint="";
            var containsConstraint="";
            var row=$scope.panel.max_rows;

            var addRow=function(rowParam){
              row=rowParam;
              return this;
            }

            var addCointainsConstraint=function(searchField){
              $scope.forEachFilter=function(fn){
                d3.keys(dashboard.current.services.filter.list)
                  .forEach(function(item,index){
                    if(dashboard.current.services.filter.list[item].active){
                      //fn(dashboard.current.services.filter.list[item].field,dashboard.current.services.filter.list[item].value);
                      fn(dashboard.current.services.filter.list[item],index);
                    }
                  });
              };

              //--contains features-->
              $scope.forEachFilter(function(filter,index){
                if(filter.field===searchField && filter.value.length>0){
                  containsConstraint="&facet.contains="+filter.value;
                }
              });
              return this;
            }

            function _createNodeFiltersList(nodeList,callback){
              var separator=function(index){
                return 0===index?"\"":" || \"";
              };
              if(callback)
                return nodeList.reduce(function(tot,curr,index, arr){return tot+separator(index)+callback(curr)+"\"";},"(")+")"
              else
                return "\""+nodeList[0].value+"\"";
            }


            function getNodes(nodeList,deactiveGlobalFilter,callback){
              var filters="";
              $scope.sjs.client.server(dashboard.current.solr.server + $scope.panel.nodesCore);
              var nodeFilter="&wt=json&facet=true&facet.pivot="+$scope.panel.nodesField+"&q=*:*&rows=0&facet.limit="+ row;
              if(nodeList!==undefined){
                filters+="&fq="+$scope.panel.nodesField+":"+_createNodeFiltersList(nodeList,callback);
              }
              if(!deactiveGlobalFilter){
                filters += filterSrv.getSolrFq(false,"cluste_h")!==''?'&' + filterSrv.getSolrFq(false,"cluste_h"):'';
              }


              return $scope.sjs.Request()
                  .setQuery(nodeFilter+filters+yearsCostraint+containsConstraint)
                  .doSearch();
            }

            function getGridStep(nodeList,step,callback){
              var deferred = $injQ.defer();
              $scope.sjs.client.server(dashboard.current.solr.server + $scope.panel.linksCore);
              //var join="&q={!join from="+$scope.panel.nodesField+" to=Cluster2 fromIndex="+$scope.panel.nodesCore+"}*:*"
              var q="&q=*:*";
              var nodeFilter="&wt=json&fq=Cluster1_str:"+_createNodeFiltersList(nodeList,callback)+"&rows="+(row*2)+"&fq=Cluster2Run_str:*/"+step+"/*&sort=Similarity_f desc";
              var stepResults={stepNodes:[],selfNode:[],links:[],stepNodesResponse:false,selfNodeResponse:false};
              function semaphore(enabled){
                if((stepResults.stepNodesResponse && stepResults.selfNodeResponse) || !enabled){
                  var nodes=stepResults.selfNode.length>0?stepResults.selfNode.concat(stepResults.stepNodes):stepResults.stepNodes;
                  deferred.resolve({nodes:nodes,links:stepResults.links});
                }
              };

              function addSimilarity(nodes,links){
                return nodes.map(function(item){
                  var linkFound=links.find(function(link){
                    return link.Cluster2==item.value;
                  });
                  if(linkFound)
                    item.Similarity_f=linkFound.Similarity_f;
                  else
                    item.Similarity_f=0;
                  return item;
                })
              }

              $scope.sjs.Request()
                  .setQuery(nodeFilter+q)
                  .doSearch()
                  .then(function(results){
                      stepResults.links=results.response.docs;
                      stepResults.selfNode=[];
                      getNodes(stepResults.links,true,function(item){
                          return item.Cluster2;
                      })
                      .then(function(results){
                          //$scope.myGrid.addNode(results.facet_counts.facet_pivot['"+$scope.panel.nodesField+"'].map(function(item){ item.year=range.getRange(0);return item;}));
                          stepResults.stepNodes=results.facet_counts.facet_pivot[$scope.panel.nodesField];
                          stepResults.stepNodes=addSimilarity(stepResults.stepNodes,stepResults.links);
                          stepResults.stepNodes=stepResults.stepNodes.sort(function(a,b){
                            return b.Similarity_f-a.Similarity_f;
                          })
                          stepResults.stepNodesResponse=true;
                          semaphore(false);
                          //deferred.resolve({nodes:results.facet_counts.facet_pivot['cluster_h'],links:links});
                      });

                      // getNodes(nodeList,true,function(item){
                      //     return item.value;
                      // })
                      // .then(function(results){
                      //     //$scope.myGrid.addNode(results.facet_counts.facet_pivot['cluster_h'].map(function(item){ item.year=range.getRange(0);return item;}));
                      //     stepResults.selfNode=results.facet_counts.facet_pivot[$scope.panel.nodesField];
                      //     stepResults.selfNode.map(function(item){item.myself=true;return item;})
                      //     stepResults.selfNodeResponse=true;
                      //     semaphore();
                      //     //deferred.resolve({nodes:results.facet_counts.facet_pivot['cluster_h'],links:links});
                      // });
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
                yearsCostraint="&fq="+$scope.panel.yearFieldName+":"+years[0];
              }else{
                yearsCostraint="&fq="+$scope.panel.yearFieldName+":["+years[0]+" TO "+years[1]+"]";
              }
              return this;
            }

            return {
              addYearsCostraint:addYearsCostraint,
              getNodes:getNodes,
              getGridStep:getGridStep,
              addCointainsConstraint:addCointainsConstraint,
              addRow:addRow
            };

          }


          return {
            createRequest:createRequest
          };
    };
});
