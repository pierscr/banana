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
  'd3tip'
],
function (angular, app, _, $, d3, d3tip) {
  'use strict';

  var module = angular.module('kibana.panels.multibar', []);
  app.useModule(module);

  module.controller('multibar', function($scope, dashboard, querySrv, filterSrv) {
//  module.controller('multibar', function($scope) {
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
      max_number_r: 10,
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
      // Show the spinning wheel icon
      $scope.panelMeta.loading = true;

      // Set Solr server
      $scope.sjs.client.server(dashboard.current.solr.server + dashboard.current.solr.core_name);
      var request = $scope.sjs.Request();

      // Construct Solr query
      var fq = '';
      if (filterSrv.getSolrFq()) {
          fq = '&' + filterSrv.getSolrFq();
      }
      var wt = '&wt=json';
      //var fl = '&fl=' + $scope.panel.field;
      var rows_limit = '&rows=' + $scope.panel.max_rows;
      var pivot_field = '&facet=true&facet.pivot=' + $scope.panel.field1 +","+$scope.panel.field2;
      var facet_fields = '&facet.field=' + $scope.panel.field1 +"&facet.field=" +$scope.panel.field2;
      var facet_limit="&facet.limit="+$scope.panel.max_number_r;

      $scope.panel.queries.query = querySrv.getQuery(0) + fq + pivot_field +facet_fields+facet_limit+ wt + rows_limit;

      // Set the additional custom query
      if ($scope.panel.queries.custom != null) {
          request = request.setQuery($scope.panel.queries.query + $scope.panel.queries.custom);
      } else {
          request = request.setQuery($scope.panel.queries.query);
      }

      // Execute the search and get results
      var results = request.doSearch();

      console.log(results);

      // Populate scope when we have results
      results.then(function(results) {
          $scope.data = {};
          // var range1set=new Set();
          // var range2set=new Set();
        // var parsedResults = d3.json.parse(results, function(d) {
          console.log("data:"+results);
          console.log("panale field1:"+$scope.panel.field1);
          console.log("panale field2:"+$scope.panel.field2);
          $scope.data = {range1:[],range2:[],values:[]};

          // $scope.data.range2 = results.facet_counts.facet_fields[$scope.panel.field2].filter(function(val,index){ if((index+1) % 2){ return val;}});
          // console.log("range2:"+  $scope.data.range2);
          $scope.data.values = d3.values(results.facet_counts.facet_pivot[$scope.panel.field1+","+$scope.panel.field2]);
          console.log("values:"+  $scope.data.values);

          $scope.addToSet=function(set,val){
              return set.add(val.value);
          };

          $scope.flatNestedArray=function(array,curr){
              return array.concat(curr.pivot);
          };




          $scope.data.range1 =  Array.from(
            $scope.data.values.reduce($scope.addToSet,new Set())
              );

          console.log("range1:"+  $scope.data.range1);

          $scope.data.range2 =  Array.from(
              $scope.data.values
                .reduce($scope.flatNestedArray,[])
                .reduce($scope.addToSet,new Set())
          );

          console.log("range2:"+  $scope.data.range2);

          $scope.render();
      });

      // Hide the spinning wheel icon
      $scope.panelMeta.loading = false;

      //-----> data retrieve

      // d3.json("/solr/example_data/cluster.json", function(data) {
      //     console.log("data:"+data);
      //     console.log("panale field1:"+$scope.panel.field1);
      //     console.log("panale field2:"+$scope.panel.field2);
      //     $scope.data = {range1:[],range2:[],values:[]};
      //     $scope.data.range1 = data.facet_counts.facet_fields[$scope.panel.field1].filter(function(val,index){ if((index+1) % 2){return val;}});
      //     console.log("range1:"+  $scope.data.range1);
      //     $scope.data.range2 = data.facet_counts.facet_fields[$scope.panel.field2].filter(function(val,index){ if((index+1) % 2){ return val;}});
      //     console.log("range2:"+  $scope.data.range2);
      //     $scope.data.values = d3.values(data.facet_counts.facet_pivot).pop();
      //     console.log("values:"+  $scope.data.values);
      //     $scope.render();
      // });

      $scope.panelMeta.loading = false;
    };
  });

  module.directive('multibarChart', function() {
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


//ordial1 (yaer)
          var x0 = d3.scale.ordinal()
            .domain(scope.data.range1)
            .rangeRoundBands([0, width],0.1);


//ordila2 (cluster)
          // var x1 = d3.scale.ordinal()
          //     .domain(scope.data.range2)
          //     .rangeRoundBands([0, x0.rangeBand()],0.05);

//conteggio
          var y = d3.scale.linear()
              .domain([0,d3.max(
                scope.data.values,
                function(d) {
                  /*
                  console.log("array to max evaluate");
                  console.log(d);
                  */
                  return d3.max(d.pivot, function(obj) {
                    /*
                    console.log("object to count");
                    console.log(obj.count);
                    */
                    return obj.count;
                  });
                  }
                )]).nice()
              .rangeRound([ height,0]);



//anni

          var z = d3.scale.ordinal()
              .range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);

          var g = chart.append("g").attr("transform", "translate(30,30)");

          var tip = d3tip()
              .attr('class', 'd3-tip')
              .offset([-10, 0])
              .html(function(d) {
                  return "<strong>Frequency:</strong> <span style='color:red'>" + d.value + "</span>";
              });

          g.selectAll("g")
            .data(scope.data.values)
            .enter().append("g")
              .attr("transform", function(d) {
                console.log(d.value);
                return "translate(" + x0(d.value) + ",0)";
              })
            .selectAll("rect")
            .data(function(d) {
              console.log("cluster data selected:");
              console.log(d);
              var range =  Array.from(d.pivot.reduce(scope.addToSet,new Set()));

              d.newScale = d3.scale.ordinal()
                  .domain(range)
                  .rangeRoundBands([0, x0.rangeBand()],0.05);

              return d.pivot;
            })
            .enter().append("rect")
              .attr("x", function(d) {

                console.log("x rect:"+d.value);
                console.log("x rect coded:"+this.parentNode.__data__.newScale(d.value));
                return this.parentNode.__data__.newScale(d.value);
              })
              .attr("y", function(d) {
                return y(d.count);
              })
              .attr("width", function(){return this.parentNode.__data__.newScale.rangeBand();})
              .attr("height", function(d) {
                console.log("object to draw");
                console.log(d);
                console.log("height calculation");
                console.log("height:"+height);
                console.log("d.value:"+d.count);
                console.log(" y(d.value):"+ y(d.count));
                console.log("eventualy y value:"+ height - y(d.count));
                return height - y(d.count);
              })
              .attr("fill", function(d) {
                console.log("color number:"+d.value);
                console.log("color code"+z(d.value));
                return z(d.value); })
              .on('mouseover', tip.show)
              .on('mouseout', tip.hide);

              chart.call(tip);


          g.append("g")
              .attr("class", "axis")
              .attr("transform", "translate(0," + height + ")")
              .call(d3.svg.axis().scale(x0).orient("bottom").tickFormat(function(d) { return d.slice(1,3); }));

          g.append("g")
              .attr("class", "axis")
              .call(d3.svg.axis().scale(y).orient("left").ticks(null, "s"))
            .append("text")
              .attr("x", 2)
              .attr("y", y(y.ticks().pop()) + 0.5)
              .attr("dy", "0.32em")
              .attr("fill", "#000")
              .attr("font-weight", "bold")
              .attr("text-anchor", "start")
              .text("Cluster count");

          var legend = g.append("g")
              .attr("font-family", "sans-serif")
              .attr("font-size", 10)
              .attr("text-anchor", "end")
            .selectAll("g")
            .data(scope.data.range2.reverse())
            .enter().append("g")
              .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

          legend.append("rect")
              .attr("x", width - 19)
              .attr("width", 19)
              .attr("height", 19)
              .attr("fill", z);

          legend.append("text")
              .attr("x", width - 24)
              .attr("y", 9.5)
              .attr("dy", "0.32em")
              .text(function(d) { return d; });
    }
  }};
});
});
