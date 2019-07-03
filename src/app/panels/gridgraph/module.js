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
      stepYear:'1',
      yearFieldName:'year',
      nodeSearch:'cluster_str'
    };

    // Set panel's default values
    _.defaults($scope.panel, _d);

    $scope.init = function() {
      $scope.$on('refresh',function(){
        if(!$scope.refreshByGridgraph){
          $scope.get_data();
        }else{
          $scope.refreshByGridgraph=false;
        }
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

    var dataSource;
    var range;
    var hierarchy;

    var updateGlobalHirarchy= function(){
      hierarchy=0;
      $scope.forEachFilter(function(filter,index){
        if(filter.field===$scope.panel.nodeSearch){
          if(filter.mandate!="either"){
              hierarchy=(decodeURIComponent(filter.value).split("/").length)
              $scope.filteredValue=filter.value;
          }else{
              hierarchy=-1;
          }
        }
      });
    }

    var hierarchyFilter=function(item){
      if(hierarchy==-1){
        return true;
      }
      var currentLevel=item.value.split("/").length-1;
      if(hierarchy>0){
        return (currentLevel==hierarchy || currentLevel==hierarchy-1);
      }else{
        return currentLevel==hierarchy;
      }
    };

    $scope.get_data = function() {

      range=rangeDate($scope.panel.startYear,$scope.panel.stepYear,2019);


      $scope.myGrid=grid();
      var processor=$scope.myGrid.plainDataProcessor();
      processor.getXDomain=range.getRange;

        $scope.myGrid
          .setDataProcessor(processor);

      dataSource=dataRetrieval($scope,dashboard,$q,filterSrv);


      $scope.myGrid.reset();
      //-->
      $scope.$emit('getNodes',0);

    };

    $scope.$on('getNodes',function(event,index){

      dataSource
        .createRequest()
        .addCointainsConstraint($scope.panel.nodeSearch)
        .addRow($scope.panel.max_rows*3)
        .addYearsCostraint(range.getRange(index).split("-"))
        .getNodes()
        .then(function(results){
            updateGlobalHirarchy();
            var nodeFacet=results.facet_counts.facet_pivot[$scope.panel.nodesField].filter(hierarchyFilter);
            nodeFacet=nodeFacet.slice(0,$scope.panel.max_rows);
            var newIndex=index+1;
            if(nodeFacet.length>0  || range.getRange(index)==undefined){
              $scope.myGrid.addNode(nodeFacet.map(function(item){ item.step=0;item.year=range.getRange(index);return item;}));
              $scope.$emit('addCiclesSteps',nodeFacet,index);
            }else{
              $scope.$emit('getNodes',newIndex);
            }
        });
    });

    $scope.$on('addStepFilter',function(event,node){
      var ids=filterSrv.idsByMandate('must');
      for(var index in ids){
          filterSrv.remove(ids[index]);
      }

      $scope.refreshByGridgraph=true;
      filterSrv.set({type:'terms',field:node.field,value:node.value,mandate:'either'});
    })

    $scope.$on('addStep',function(event,nodeList){
      var stepNumber=nodeList[0].col;
      if(range.getRange(stepNumber+1)!=undefined){
        dataSource
          .createRequest()
          .addYearsCostraint(range.getRange(stepNumber+1).split("-"))
          .addRow($scope.panel.max_rows)
          .getGridStep(nodeList,range.getRange(stepNumber+1).split("-")[0])
          .then(function(results){
              $scope.myGrid.addLink(results.links.map(function(item){ item.step=stepNumber+1;return item;}));
              $scope.myGrid.addNode(results.nodes.map(function(item){ item.step=stepNumber+1; item.year=range.getRange(stepNumber+1);return item;}));
              $scope.myGrid.stepFn(stepNumber);
              $scope.$emit('render');
          });
      }
      dashboard.refresh();
    });

    $scope.$on('addCiclesSteps',function(event,nodeList,stepNumber){;
      if(range.getRange(stepNumber+1)!=undefined){
        dataSource
          .createRequest()
          .addYearsCostraint(range.getRange(stepNumber+1).split("-"))
          .addRow($scope.panel.max_rows)
          .getGridStep(nodeList,range.getRange(stepNumber+1).split("-")[0],function(item){
              return item.value;
          })
          .then(function(results){
              var nodes=results.nodes.map(function(item){ item.step=stepNumber+1; item.year=range.getRange(stepNumber+1);return item;})
              $scope.myGrid.addLink(results.links.map(function(item){ item.step=stepNumber+1;return item;}));
              $scope.myGrid.addNode(nodes);
              $scope.myGrid.stepFn(stepNumber);
              $scope.$emit('render');
              $scope.$emit('addCiclesSteps',nodes,stepNumber+1);
          });
      }
      //dashboard.refresh();
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

          var createLabelRow=function(string){
            var self=this;
            this.concat=function(attr,value){
              string=string.concat("<div><strong>"+attr+"</strong> <span style='color:red'>"+ value +"</span></div>")
              return self;
            }
            this.build=function(){
              return string;
            }
            return self;
          }

          var tipNode = d3tip()
              .attr('class', 'd3-tip')
              .offset([-10, 0])
              .direction(function(d) {
                var dir;
                (d.x>(parent_width/2))?dir='w':dir='e';
                return dir;
              })
              .html(function(d) {
                var cluster_levels=(typeof d.name === 'string' ?  d.name.split("/"): d.value.split("/"));
                var label = createLabelRow.call({},"")
                  .concat("Name",(typeof d.name === 'string' ?  cluster_levels.pop(): cluster_levels.pop()) )
                  .concat("Frequency",d.count)
                  .concat("Level",(typeof d.name === 'string' ?  d.name.split("/").length-1: d.value.split("/").length-1));

                  cluster_levels.map(function(value,index){
                    label.concat("Parent"+index,value);
                  });

                  return label.build();
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
          scope.$emit('addStepFilter',d);
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
