/*
  ## Bar module
  * For tutorial on how to create a custom Banana module.
*/
define([
  'angular',
  'app',
  'underscore',
  'jquery',
  'd3',
  'd3tip',
  'dataGraphMapping'
],
function (angular, app, _, $, d3,d3tip,dataGraphMapping) {
  'use strict';

  var module = angular.module('kibana.panels.networkgraph', []);
  app.useModule(module);

//  module.controller('multibar', function($scope, dashboard, querySrv, filterSrv) {
  module.controller('networkgraph', function($scope, dashboard, querySrv, filterSrv) {
    $scope.panelMeta = {
      modals: [
        {
          description: 'Inspect',
          icon: 'icon-info-sign',
          partial: 'app/partials/inspector.html',
          show: $scope.panel.spyable
        }
      ],
      editorTabs: [
        {
          title: 'Queries',
          src: 'app/partials/querySelect.html'
        }
      ],
      status: 'Experimental',
      description: 'Bar module for tutorial'
    };

    // Define panel's default properties and values
    var _d = {
      queries: {
        mode: 'all',
        query: '*:*',
        custom: ''
      },
      nodesCore: '',
      nodesField: '',
      linksCore:'',
      max_rows: 10,
      spyable: true,
      show_queries: true,
      linkDistance:50,
      charge:-100,
      gravity:0.05,
      maxLinkDistance:100,
      minLinkDistance:50,
      minNodeSize:80,
      maxNodeSize:120,
      fontSize:12
    };

    // Set panel's default values
    _.defaults($scope.panel, _d);

    $scope.init = function() {
      $scope.$on('refresh',function(){
        $scope.get_data();
      });
      $scope.get_data();
    };

    $scope.set_refresh = function(state) {
      $scope.refresh = state;
    };

    $scope.close_edit = function() {
      if ($scope.refresh) {
        $scope.get_data();
      }
      $scope.refresh = false;
      $scope.$emit('render');
    };

    $scope.render = function() {
      $scope.$emit('render');
    };

    // $scope.build_search = function(field1,word) {
    //   if(word) {
    //     filterSrv.set({type:'terms',field:field1,value:word,mandate:'either'});
    //   } else {
    //     return;
    //   }
    //   dashboard.refresh();
    // };

    $scope.constructSolrQuery=function(facetField,addGlobalQueryFlag){
      // Construct Solr query
      // var fq = '';
      // if (filterSrv.getSolrFq()) {
      //     fq = '&' + filterSrv.getSolrFq();
      // }
      var wt = '&wt=json';
      //var facet_limit="&facet.limit="+$scope.panel.max_number_r;
      var pivot_field="&facet=true&facet.pivot="+facetField;
      var result=wt;
      if(facetField){
        result+=pivot_field;
      }
      if(addGlobalQueryFlag){
        result+="&"+querySrv.getQuery(0);
      }else{
        result+="&q=*:*";
      }
      return $scope.panel.queries.query = result;
    };

      $scope.forEachFilter=function(fn){
        d3.keys(dashboard.current.services.filter.list)
          .forEach(function(item){
            if(dashboard.current.services.filter.list[item].active){
              fn(dashboard.current.services.filter.list[item].field,dashboard.current.services.filter.list[item].value);
            }
          });
      };



    $scope.get_data = function() {

      $scope.sjs.client.server(dashboard.current.solr.server + $scope.panel.nodesCore);
      var nodeRequest = $scope.sjs.Request();
      var filtersQr='';
      // $scope.forEachFilter(function(key,value){
      //     if(key!==$scope.panel.nodesField){
      //       filtersQr=filtersQr+'&fq=' +key+':'+value;
      //     }
      //   });
      filtersQr = '&' + filterSrv.getSolrFq(false,$scope.panel.nodesField);
      nodeRequest.setQuery(
        $scope.constructSolrQuery($scope.panel.nodesField,true)+filtersQr
      );
      var results = nodeRequest.doSearch();
      results
        .then(function(results) {
          $scope.data=
            {
              nodes:results.facet_counts.facet_pivot[$scope.panel.nodesField],
              links:[]
            };
      }).then(function(){
        $scope.sjs.client.server(dashboard.current.solr.server + $scope.panel.linksCore);
        var linksRequest = $scope.sjs.Request();
            linksRequest.setQuery(
              $scope.constructSolrQuery()+"&rows=4000"
            );
        linksRequest
          .doSearch()
          .then(function(linkResults){
             $scope.data.links=linkResults.response.docs;

             var initModule=dataGraphMapping();
             initModule
                .nodes($scope.data.nodes)
                .links($scope.data.links);

              $scope.forEachFilter(function(key,value){
                  if(key===$scope.panel.nodesField){
                    initModule.filter(decodeURIComponent(value));
                  }
                });

            initModule.build();

            $scope.data.nodes=initModule.filteredNodes();
            $scope.data.links=initModule.indexedLinks();
            $scope.render();
          });
      });

      $scope.panelMeta.loading = false;
    };
  });

  module.directive('networkgraphChart', function(filterDialogSrv) {
    return {
      restrict: 'E',
      link: function(scope, element)  {
        scope.$on('render',function(){
          render_panel();
        });

        // Render the panel when resizing browser window
        angular.element(window).bind('resize', function() {
          render_panel();
        });

        // Function for rendering panel
        function render_panel() {
          // Clear the panel
          element.html('');

          var animationStep = 400;

          var parent_width = element.parent().width(),
          parentheight = parseInt(scope.row.height),
          width = parent_width - 20,
          height = parentheight -50;



          var zoom = d3.behavior.zoom();
          var zoomEnable=true;
          var zoomScale;
          var zoomtX;

          var chart = d3.select(element[0]).append('svg')
            .attr('width', parent_width)
            .attr('height', parentheight)
            .call(zoom);

          chart
            .on('mouseup',function(){
              !zoomEnable && zoom.scale(zoomScale);
              !zoomEnable && zoom.translate(zoomtX);
              zoomEnable=true;
            });

          var tipLink = d3tip()
              .attr('class', 'd3-tip')
              .offset([-10, 0])
              .html(function(d) {
                return "<div><strong>Similarity</strong> <span style='color:red'>" + d.Similarity + "</span></div>";
              });

          var tipNode = d3tip()
              .attr('class', 'd3-tip')
              .offset([-10, 0])
              .html(function(d) {
                return "<div><strong>Name</strong> <span style='color:red'>"+ (typeof d.name === 'string' ?  d.name.split("/").pop(): '') +"</span></div>"
                +"<div><strong>Frequency</strong> <span style='color:red'>" + d.count + "</span></div>";
              });

          // node distance scale
          var distanceScale =   d3.scale.log()
                            .base(Math.E)
                            .domain([d3.min(scope.data.links,function(link){
                                        return link.Similarity;
                                    }),d3.max(scope.data.links,function(link){
                                        return link.Similarity;
                                    })])
                            .rangeRound([scope.panel.maxLinkDistance,scope.panel.minLinkDistance]);

          // node distance scale
          var lineStroke =   d3.scale.log()
            .base(Math.E)
            .domain([d3.min(scope.data.links,function(link){
              return link.Similarity;
            }),d3.max(scope.data.links,function(link){
              return link.Similarity;
            })])
            .rangeRound([1,1]);

                            // node distance scale
          var nodeSize =  d3.scale.log()
            .base(Math.E)
            .domain([d3.min(scope.data.nodes,function(node){
              return node.count;
            }),d3.max(scope.data.nodes,function(node){
              return node.count;
            })])
            .rangeRound([scope.panel.minNodeSize,scope.panel.maxNodeSize]);


          var force = d3.layout
            .force()
            .linkDistance(function(link){
              return distanceScale(link.Similarity);
            })
            .charge(scope.panel.charge)
            .gravity(scope.panel.gravity)
            .size([width, height]);

           force
              .nodes(scope.data.nodes)
              .links(scope.data.links);

            var link = chart.selectAll('.link')
              .data(scope.data.links)
              .enter().append('line')
              .attr('class', 'link')
              .attr('x1', function(d) { return d.source.x; })
              .attr('y1', function(d) { return d.source.y; })
              .attr('x2', function(d) { return d.target.x; })
              .attr('y2', function(d) { return d.target.y; })
              .attr("stroke-width", function(link){return lineStroke(link.Similarity);})
              .on('mouseover', tipLink.show)
              .on('mouseout', tipLink.hide);

            link.insert('line')
              .attr('class', 'linkForTips')
              .attr('x1', function() { return this.parentNode.__data__.source.x; })
              .attr('y1', function() { return this.parentNode.__data__.source.y; })
              .attr('x2', function() { return this.parentNode.__data__.target.x; })
              .attr('y2', function() { return this.parentNode.__data__.target.y; })
              .attr("stroke-width", 5);

          // Now it's the nodes turn. Each node is drawn as a circle.


          var node = chart.selectAll('.node')
              .data(scope.data.nodes)
              .enter().append('g')
              .attr('class', 'node')
              .attr("transform", function(d){
                return "translate("+d.x+","+d.y+")";
              })
              .on('click', function(d){  tipLink.hide(); tipNode.hide(); filterDialogSrv.showDialog(scope.panel.nodesField,d.name || d.value);})
              .on('mousedown',function(){
                  zoomScale=zoom.scale();
                  zoomtX=zoom.translate();
                  zoomEnable=false;
              })
              .on('mouseup',function(){
                  !zoomEnable && zoom.scale(zoomScale);
                  !zoomEnable && zoom.translate(zoomtX);
                  zoomEnable=true;
              })
              .on('mouseover', tipNode.show)
              .on('mouseout', function(){
                tipNode.hide();
                //filterDialogSrv.hideDialog();
              });






            node.append('circle')
                .attr('r', function(d){
                  return nodeSize(d.count);
                })
                .call(force.drag);

              // node
              //     .append('text')
              //     .text(function(d){return  d.name || d.value;})
              //     .attr('x',20)
              //     .attr('y',-10)
              //     .style('font-size',scope.panel.fontSize+'px');

            chart.call(tipLink);
            chart.call(tipNode);

              force.on("tick", function() {


                node.transition().ease('linear').duration(animationStep)
                                      .attr("transform",function(d){
                                                          if(zoomEnable){
                                                            return "translate("+d.x*zoom.scale()+","+d.y*zoom.scale()+")translate("+zoom.translate()[0]+","+zoom.translate()[1]+")";
                                                          }else{
                                                            return "translate("+d.x*zoomScale+","+d.y*zoomScale+")translate("+zoomtX[0]+","+zoomtX[1]+")";
                                                          }
                                                        });


                var animationNode=node.selectAll('circle')
                    .transition().ease('linear').duration(animationStep);

                zoomEnable && animationNode.attr('transform','scale('+zoom.scale()+')');
                !zoomEnable && animationNode.attr('transform','scale('+zoomScale+')');


                node.selectAll('text')
                    .transition().ease('linear').duration(animationStep);


              // We also need to update positions of the links.
              // For those elements, the force layout sets the
              // `source` and `target` properties, specifying
              // `x` and `y` values in each case.

              // Here's where you can see how the force layout has
              // changed the `source` and `target` properties of
              // the links. Now that the layout has executed at least
              // one iteration, the indices have been replaced by
              // references to the node objects.

              var animationLink=link.transition().ease('linear').duration(animationStep)
                  .attr('x1', function(d) { return d.source.x; })
                  .attr('y1', function(d) { return d.source.y; })
                  .attr('x2', function(d) { return d.target.x; })
                  .attr('y2', function(d) { return d.target.y; });


              zoomEnable && animationLink.attr('transform','translate('+zoom.translate()+')scale('+zoom.scale()+')');
              !zoomEnable && animationLink.attr('transform','translate('+zoomtX+')scale('+zoomScale+')');



              force.stop();
                  setTimeout(
                      function() { force.start(); },
                      200
                  );
          });

          force.start();
    }
  }};
});
});
