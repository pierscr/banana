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
  'dataGraphMapping'
],
function (angular, app, _, $, d3,dataGraphMapping) {
  'use strict';

  var module = angular.module('kibana.panels.networkgraph', []);
  app.useModule(module);

//  module.controller('multibar', function($scope, dashboard, querySrv, filterSrv) {
  module.controller('networkgraph', function($scope, dashboard, querySrv) {
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
      charge:-300,
      gravity:0.1
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

    $scope.constructSolrQuery=function(facetField){
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
      return $scope.panel.queries.query = querySrv.getQuery(0)+result;
    };

    $scope.get_data = function() {

      $scope.sjs.client.server(dashboard.current.solr.server + $scope.panel.nodesCore);
      var nodeRequest = $scope.sjs.Request();
      nodeRequest.setQuery(
        $scope.constructSolrQuery($scope.panel.nodesField)
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
              $scope.constructSolrQuery()
            );
        linksRequest
          .doSearch()
          .then(function(linkResults){
             $scope.data.links=linkResults.response.docs;

             var initModule=dataGraphMapping();
             initModule
                .nodes($scope.data.nodes)
                .links($scope.data.links);

              d3.keys(dashboard.current.services.filter.list)
                .forEach(function(filterKeys){
                    console.log("filterKey: "+filterKeys);
                  if(dashboard.current.services.filter.list[filterKeys].field===$scope.panel.nodesField){
                    console.log("found: "+dashboard.current.services.filter.list[filterKeys].value);
                    var newFilter=decodeURIComponent(dashboard.current.services.filter.list[filterKeys].value);
                    initModule.filter(newFilter);
                  }
                });

            initModule.build();

            $scope.data.nodes=initModule.filteredNodes();
            $scope.data.links=initModule.indexedLinks();
            $scope.render();
          });
      });

      // d3.json("example_data/networkgraph.json", function(data) {
      //     console.log("data:"+data);
      //     console.log("panale field1:"+$scope.panel.field1);
      //     console.log("panale field2:"+$scope.panel.field2);
      //     $scope.data = data;
      //     // $scope.data.range1 = data.facet_counts.facet_fields[$scope.panel.field1].filter(function(val,index){ if((index+1) % 2){return val;}});
      //     // console.log("range1:"+  $scope.data.range1);
      //     // $scope.data.range2 = data.facet_counts.facet_fields[$scope.panel.field2].filter(function(val,index){ if((index+1) % 2){ return val;}});
      //     // console.log("range2:"+  $scope.data.range2);
      //     // $scope.data.values = d3.values(data.facet_counts.facet_pivot).pop();
      //     // console.log("values:"+  $scope.data.values);
      //     $scope.render();
      // });

      $scope.panelMeta.loading = false;
    };
  });

  module.directive('networkgraphChart', function() {
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

          var chart = d3.select(element[0]).append('svg')
                        .attr('width', parent_width)
                        .attr('height', parentheight)
                        .call(zoom);



          var force = d3.layout
            .force()
            .linkDistance(scope.panel.linkDistance)
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
              .attr('y2', function(d) { return d.target.y; });

          // Now it's the nodes turn. Each node is drawn as a circle.

          var node = chart.selectAll('.node')
              .data(scope.data.nodes)
              .enter().append('g')
              .attr('class', 'node')
              .attr("transform", function(d){
                return "translate("+d.x+","+d.y+")";
              });





            node.append('circle')
                .attr('r', width/150)
                .call(force.drag);

              node
                  .append('text')
                  .text(function(d){return d.name;})
                  .attr('x',20)
                  .attr('y',-10);

              force.on("tick", function() {


                node.transition().ease('linear').duration(animationStep)
                    .attr("transform",function(d){
                                        return "translate("+d.x*zoom.scale()+","+d.y*zoom.scale()+")translate("+zoom.translate()[0]+","+zoom.translate()[1]+")";
                                      });

                node.selectAll('circle')
                    .transition().ease('linear').duration(animationStep)
                    .attr('transform','scale('+zoom.scale()+')');
                    // .attr("cx",zoom.translate()[0])
                    // .attr("cy",zoom.translate()[1]);

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

              link.transition().ease('linear').duration(animationStep)
                  .attr('x1', function(d) { return d.source.x; })
                  .attr('y1', function(d) { return d.source.y; })
                  .attr('x2', function(d) { return d.target.x; })
                  .attr('y2', function(d) { return d.target.y; })
                  .attr('transform','translate('+zoom.translate()+')scale('+zoom.scale()+')');



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
