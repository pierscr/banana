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
  'grid',
  'dataRetrieval',
  'rangeDate',
  'strHandler'
],
function (angular, app, _, $, d3,d3tip,dataGraphMapping,grid,dataRetrieval,rangeDate,strHandler) {
  'use strict';

  var module = angular.module('kibana.panels.gridgraph', []);
  app.useModule(module);

//  module.controller('multibar', function($scope, dashboard, querySrv, filterSrv) {
  module.controller('gridgraph', function($scope, dashboard, querySrv,$q,filterSrv) {
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
      nodesField: 'cluster_h',
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
      fontSize:12,
      startYear:'2000',
      stepYear:'1'
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

    var range=rangeDate($scope.panel.startYear,$scope.panel.stepYear,2019);


    $scope.myGrid=grid();
    var processor=$scope.myGrid.plainDataProcessor();
    processor.getXDomain=range.getRange;

      $scope.myGrid
        .setDataProcessor(processor);

    var dataSource=dataRetrieval($scope,dashboard,$q,filterSrv);

    $scope.get_data = function() {


      $scope.myGrid.reset();
      //-->
      dataSource
        .createRequest()
        .addYearsCostraint(range.getRange(0).split("-"))
        .getNodes()
        .then(function(results){
            $scope.myGrid.addNode(results.facet_counts.facet_pivot[$scope.panel.nodesField].map(function(item){ item.step=0;item.year=range.getRange(0);return item;}));
            $scope.$emit('render');
        });

    };

    $scope.$on('addStep',function(event,nodeList){
      var stepNumber=nodeList[0].col;
      dataSource
        .createRequest()
        .addYearsCostraint(range.getRange(stepNumber+1).split("-"))
        .getGridStep(nodeList)
        .then(function(results){
            $scope.myGrid.addLink(results.links.map(function(item){ item.step=stepNumber+1;return item;}));
            $scope.myGrid.addNode(results.nodes.map(function(item){ item.step=stepNumber+1; item.year=range.getRange(stepNumber+1);return item;}));
            $scope.myGrid.stepFn(stepNumber);
            $scope.$emit('render');
        });

    });

  });

  module.directive('gridgraphChart', function(filterDialogSrv) {
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

          var tipNode = d3tip()
              .attr('class', 'd3-tip')
              .offset([-10, 0])
              .direction(function(d) {
                var dir;
                (d.x>(parent_width/2))?dir='w':dir='e';
                return dir;
              })
              .html(function(d) {
                return "<div>"+strHandler.lstName(d.value)+"</div><div>"+d.count+"</div>";
              });

          var tipLink = d3tip()
              .attr('class', 'd3-tip')
              .offset([-10, 0])
              .html(function(d) {
                return "<div><strong>Similarity</strong> <span style='color:red'>" + d.Similarity + "</span></div>";
              });


          scope.myGrid
            .size([parentheight,parent_width])
            .addTitleHeight(30);

          var chart = d3.select(element[0]).append('svg')
            .attr('width', parent_width)
            .attr('height', parentheight);

          scope.myGrid
            .rowField("name")
            .colField("year")
            .build();

          chart.selectAll('.title')
            .data(scope.myGrid.getTitleList())
            .enter().append('text')
            .text(function(d){return d.title;})
            .attr('x',function(d){return d.x;})
            .attr('y',function(d){return d.y;})
            .style('font-size',scope.panel.fontSize+'px');

        var lineStroke =   d3.scale.linear()
          .domain([d3.min(scope.myGrid.links(),function(link){
            return link.Similarity;
          }),d3.max(scope.myGrid.links(),function(link){
            return link.Similarity;
          })])
          .rangeRound([1,10]);


          var nodeSize =  d3.scale.log()
            .base(Math.E)
            .domain([d3.min(scope.myGrid.nodes(),function(node){
              return node.count;
            }),d3.max(scope.myGrid.nodes(),function(node){
              return node.count;
            })])
            .rangeRound([3,12]);

            chart.selectAll('.link')
              .data(scope.myGrid.links())
              .enter().append('line')

              .attr('class', 'link')
              .attr('x1', function(d) { return d.x1; })
              .attr('y1', function(d) { return d.y1; })
              .attr('x2', function(d) { return d.x2; })
              .attr('y2', function(d) { return d.y2; })
              .attr("stroke-width", function(link){ var r=lineStroke(link.Similarity);return r<10?r:10})
              .attr('transform','scale(0)')
              .on('mouseover', tipLink.show)
              .on('mouseout', tipLink.hide)
              .transition().duration(1000)
              .attr('transform','scale(1)');


          var node = chart.selectAll('.node')
            .data(scope.myGrid.nodes())
            .enter().append('g');

          node
            .transition().duration(1000)
            .attr('class', 'node')
            .attr("transform", function(d){
              return "translate("+d.x+","+d.y+")";
            });

          node.append('circle')
            .attr('r',function(d){return nodeSize(d.count)+"px";});

          // node.append('text')
          //   .text(function(d){return "";})
          //   .attr('x',20)
          //   .attr('y',-10)
          //   .style('font-size',scope.panel.fontSize+'px');

        node.on('click', function(d){
          //filterDialogSrv.showDialog2();
          tipNode.hide();
          scope.$emit('addStep',[d]);
        })
        .on('mouseover', tipNode.show)
        .on('mouseout', function(){
          tipNode.hide();
          //filterDialogSrv.hideDialog();
        });


        chart.call(tipNode);
        chart.call(tipLink);

    }

  }};
});
});
