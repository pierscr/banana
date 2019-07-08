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
  'dataRetrieval'
],
function (angular, app, _, $, d3,d3tip,dataGraphMapping,dataRetrieval) {
  'use strict';

  var module = angular.module('kibana.panels.networkgraph', []);
  app.useModule(module);

//  module.controller('multibar', function($scope, dashboard, querySrv, filterSrv) {
  module.controller('networkgraph', function($scope, dashboard, querySrv, filterSrv,$q) {
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
      linkValue:0.1,
      linkNumber:20,
      nodelimit:'',
      nodeSearch:'cluster_h',
      nodeLink1:'Cluster1',
      nodeLink2:'Cluster2'
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
    //dashboard.current.services.filter.list[item].mandate

    $scope.filteredValue=[];
    var hierarchy;
    var updateGlobalHirarchy= function(){
      hierarchy=0;
      $scope.forEachFilter(function(filter,index){
        if(filter.field===$scope.panel.nodeSearch){
          if(filter.mandate!="either"){
              hierarchy=(decodeURIComponent(filter.value).split("/").length)

          }else{
              hierarchy=-1;
          }
          $scope.filteredValue.push(decodeURIComponent(filter.value));
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
      $scope.filteredValue=[];
      var dataSource=dataRetrieval($scope,dashboard,$q,filterSrv);

      dataSource
        .createRequest()
        .addCointainsConstraint($scope.panel.nodeSearch)
        .addRow($scope.panel.nodelimit)
        .getNodes()
        .then(function(results){
          updateGlobalHirarchy();
          $scope.data=
            {
              nodes:results.facet_counts.facet_pivot[$scope.panel.nodesField].filter(hierarchyFilter),
              links:[]
            };
            $scope.sjs.client.server(dashboard.current.solr.server + $scope.panel.linksCore);
            var nodesClouse="";
            if(Array.isArray($scope.data.nodes) && $scope.data.nodes.length>0){
            nodesClouse="(\""+$scope.data.nodes[0].value;
              for(var index=1;index<$scope.data.nodes.length;index++){
                nodesClouse+="\" || \""+$scope.data.nodes[index].value;
              }
            nodesClouse+="\")";
            }
            var nodePar="&q="+$scope.panel.nodeLink1+":"+nodesClouse+" && "+$scope.panel.nodeLink2+":"+nodesClouse;
            //var nodePar="&q="+$scope.panel.nodeLink1+":"+nodesClouse;
            var linksRequest = $scope.sjs.Request();
                linksRequest.setQuery(
                  //"wt=json&rows=60000"+"&fq=Similarity:["+$scope.panel.linkValue+" TO *]"+nodePar+"&sort=Similarity_f desc"
                  "wt=json&rows="+$scope.panel.linkNumber*3+"&fq=Similarity:["+$scope.panel.linkValue+" TO *]"+nodePar+"&sort=Similarity_f desc"
                );
            linksRequest
              .doSearch()
              .then(function(linkResults){
                 $scope.data.links=linkResults.response.docs;

                 var initModule=dataGraphMapping();
                 initModule
                    .nodes($scope.data.nodes)
                    .links($scope.data.links.filter(function(link){return link.Similarity>$scope.panel.linkValue;}));

                  $scope.forEachFilter(function(filter,index){
                      if(filter.field===$scope.panel.nodesField){
                        initModule.filter(decodeURIComponent(filter.value));
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
            .rangeRound([1,10]);

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
              .nodes(scope.data.nodes.filter(function(node){return node.count;}))
              .links(scope.data.links.filter(function(link){return link.Similarity>scope.panel.linkValue;}));

            var link = chart.selectAll('.link')
              .data(scope.data.links.filter(function(link){return link.Similarity>scope.panel.linkValue;}))
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
              .attr("stroke-width", 15);

          // Now it's the nodes turn. Each node is drawn as a circle.


          var node = chart.selectAll('.node')
              .data(scope.data.nodes)
              .enter().append('g')
              .attr('class', function(d){
                if(scope.filteredValue.includes(d.value)){
                  return 'node2';
                }
                return 'node';
              })
              .attr("transform", function(d){
                return "translate("+d.x+","+d.y+")";
              })
              .on('click', function(d){
                tipLink.hide();
                tipNode.hide();
                filterDialogSrv.addMode('compare');
                filterDialogSrv.showDialog(scope.panel.nodeSearch,d.name || d.value);
              })
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
                                                            if(isNaN(d.x) || isNaN(d.y)) {return;}
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
