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
  'dataGraphMapping',
  'grid'
],
function (angular, app, _, $, d3,d3tip,dataGraphMapping,grid) {
  'use strict';

  var module = angular.module('kibana.panels.gridgraph', []);
  app.useModule(module);

//  module.controller('multibar', function($scope, dashboard, querySrv, filterSrv) {
  module.controller('gridgraph', function($scope, dashboard, querySrv) {
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

      $scope.forEachFilter=function(fn){
        d3.keys(dashboard.current.services.filter.list)
          .forEach(function(item){
            fn(dashboard.current.services.filter.list[item].field,dashboard.current.services.filter.list[item].value);
          });
      };



    $scope.get_data = function() {

      setTimeout(function(){

            $scope.nodes=[
              {id:0,"name":"flower|case|device|watering",value:"210",year:"2016"},
              {id:1,"name":"flower|case|device|type",value:"120",year:"2016"},
              {id:2,"name":"gun,flower,device,machine",value:"60",year:"2016"},
              {id:3,"name":"flower|case|device|watering",value:"250",year:"2017"},
              {id:4,"name":"material,fabric,flower,anti",value:"35",year:"2017"},
              {id:5,"name":"flower|case|device|watering",value:"310",year:"2018"}
            ];

            $scope.links=[
              {"source": 0,"target": 3,"value": [0.29499688199934504]},
              {"source": 2,"target": 3,"value": [0.054597872395713454]},
              {"source": 4,"target": 5,"value": [0.046069246728398294]}
            ];


      $scope.render();

    },1000);

    };
  });

  module.directive('gridgraphChart', function() {
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


          var parent_width = element.parent().width(),
            parentheight = parseInt(scope.row.height);


          var chart = d3.select(element[0]).append('svg')
            .attr('width', parent_width)
            .attr('height', parentheight);

          var myGrid=grid(scope.nodes,scope.links);

          myGrid
            .setDataProcessor(myGrid.plainDataProcessor)
            .rowField("name")
            .colField("year")
            .size([parentheight,parent_width])
            .build();


            chart.selectAll('.link')
              .data(myGrid.links())
              .enter().append('line')

              .attr('class', 'link')
              .attr('x1', function(d) { return d.x1; })
              .attr('y1', function(d) { return d.y1; })
              .attr('x2', function(d) { return d.x2; })
              .attr('y2', function(d) { return d.y2; })
              .attr('transform','scale(0)')
              .transition().duration(1000)
              .attr('transform','scale(1)');

          var node = chart.selectAll('.node')
            .data(myGrid.nodes())
            .enter().append('g');

          node
            .transition().duration(1000)
            .attr('class', 'node')
            .attr("transform", function(d){
              return "translate("+d.x+","+d.y+")";
            });






          node.append('circle')
            .attr('r',"10px");

          node.append('text')
            .text(function(d){return d.name;})
            .attr('x',20)
            .attr('y',-10)
            .style('font-size',scope.panel.fontSize+'px');

    }


    render_panel();
  }};
});
});
