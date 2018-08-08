/*
  ## Bar module
  * For tutorial on how to create a custom Banana module.
*/
define([
  'angular',
  'app',
  'underscore',
  'jquery',
  'd3'
],
function (angular, app, _, $, d3) {
  'use strict';

  var module = angular.module('kibana.panels.networkgraph', []);
  app.useModule(module);

//  module.controller('multibar', function($scope, dashboard, querySrv, filterSrv) {
  module.controller('networkgraph', function($scope) {
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
      field1: '',
      field2: '',
      max_rows: 10,
      spyable: true,
      show_queries: true
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

    $scope.get_data = function() {
      // // Show the spinning wheel icon
      // $scope.panelMeta.loading = true;
      //
      // // Set Solr server
      // $scope.sjs.client.server(dashboard.current.solr.server + dashboard.current.solr.core_name);
      // var request = $scope.sjs.Request();
      //
      // // Construct Solr query
      // var fq = '';
      // if (filterSrv.getSolrFq()) {
      //     fq = '&' + filterSrv.getSolrFq();
      // }
      // var wt = '&wt=json';
      // //var fl = '&fl=' + $scope.panel.field;
      // var rows_limit = '&rows=' + $scope.panel.max_rows;
      // var pivot_field = '&facet.pivot=' + $scope.panel.field;
      //
      // $scope.panel.queries.query = querySrv.getQuery(0) + fq + pivot_field + wt + rows_limit;
      //
      // // Set the additional custom query
      // if ($scope.panel.queries.custom != null) {
      //     request = request.setQuery($scope.panel.queries.query + $scope.panel.queries.custom);
      // } else {
      //     request = request.setQuery($scope.panel.queries.query);
      // }
      //
      // // Execute the search and get results
      // var results = request.doSearch();
      //
      // console.log(results);
      //
      // // Populate scope when we have results
      // results.then(function(results) {
      //   $scope.data = {};
      //
      //   var parsedResults = d3.json.parse(results, function(d) {
      //     return d.facet_counts.facet_pivot[$scope.panel.field];
      //     // d[$scope.panel.field] = +d[$scope.panel.field]; // coerce to number
      //     // return d;
      //   });
      //
      //   $scope.data = _.pluck(parsedResults,$scope.panel.field);
      //   $scope.render();
      // });
      //
      // // Hide the spinning wheel icon
      // $scope.panelMeta.loading = false;

      d3.json("/solr/example_data/networkgraph.json", function(data) {
          console.log("data:"+data);
          console.log("panale field1:"+$scope.panel.field1);
          console.log("panale field2:"+$scope.panel.field2);
          $scope.data = data;
          // $scope.data.range1 = data.facet_counts.facet_fields[$scope.panel.field1].filter(function(val,index){ if((index+1) % 2){return val;}});
          // console.log("range1:"+  $scope.data.range1);
          // $scope.data.range2 = data.facet_counts.facet_fields[$scope.panel.field2].filter(function(val,index){ if((index+1) % 2){ return val;}});
          // console.log("range2:"+  $scope.data.range2);
          // $scope.data.values = d3.values(data.facet_counts.facet_pivot).pop();
          // console.log("values:"+  $scope.data.values);
          $scope.render();
      });

      $scope.panelMeta.loading = false;
    };
  });

  module.directive('networkgraphChart', function() {
    return {
      restrict: 'E',
      link: function(scope, element) {
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
//              barHeight = height / scope.data.length;
              console.log("height:"+height);
              console.log("width"+ width );
          // var x = d3.scale.linear()
          //           .domain([0, d3.max(scope.data)])
          //           .range([0, width]);

          var chart = d3.select(element[0]).append('svg')
                        .attr('width', parent_width)
                        .attr('height', parentheight);

          //var margin = {top: 20, right: 20, bottom: 30, left: 40};


          //var g = chart.append("g").attr("transform", "translate(30,30)");

          var force = d3.layout
            .force()
            .linkDistance(30)
            .charge(-50)
            .gravity(0.1)
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
              .attr("transform", function(d){return "translate("+d.x+","+d.y+")";});


              node
                .append('text')
                .text(function(d){return d.name;})
                .attr('x',20);


              node.append('circle')
                  .attr('r', width/250);

          force.on("tick", function() {


                node.transition().ease('linear').duration(animationStep)
                    .attr("transform", function(d){return "translate("+d.x+","+d.y+")";});



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
                  .attr('y2', function(d) { return d.target.y; });



              force.stop();
                  setTimeout(
                      function() { force.start(); },
                      200
                  );
          });

          force.start();

          console.log(node);
    }
  }};
});
});
