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
  'dataRetrieval',
  'clusterTooltip',
  'labelTooltip',
  'patentDescription',
  'labelText'
],
function (angular, app, _, $, d3,d3tip,dataGraphMapping,dataRetrieval,clusterTooltip,labelTooltip,patentDescription,labelText) {
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
      nodeLink2:'Cluster2',
      patent:false,
      label:false,
      patentDescriptionCollection:"cpc_codes"
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


    var hierarchy;
    var updateGlobalHirarchy= function(){
      hierarchy=0;
      $scope.filteredValue=[];
      $scope.forEachFilter(function(filter,index){

        if(filter.field===$scope.panel.nodesField.split(',').reverse().pop() || filter.field==="cluster_h_str"){
          if(filter.mandate!="either" && filter.field===$scope.panel.nodesField){
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
      var dataSource=dataRetrieval($scope,dashboard,$q,filterSrv,querySrv);

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

  module.directive('networkgraphChart', function(filterDialogSrv,dashboard) {
    return {
      restrict: 'E',
      link: function(scope, element)  {
        var justClickFlag=false;
        var mouseDownFlag=false;

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
          scope.stopFlag=false;

          var animationStep = 400;

          var parent_width = element.parent().width(),
          parentheight = parseInt(scope.row.height),
          width = parent_width - 20,
          height = parentheight -50;



          var zoom = d3.behavior.zoom();

          var svg = d3.select(element[0]).append('svg')
            .attr('width', parent_width)
            .attr('height', parentheight)


          var chart = svg.append("g");

          chart
            .on('mouseup',function(){
              mouseDownFlag=false;
              console.log('mouseup')
            })
            .on("mousedown", function(d) {
              justClickFlag=true;
              mouseDownFlag=true;
              console.log('mousedown')
            })
            .on("mousemove",function(){
              justClickFlag=false;
              if(mouseDownFlag){
                console.log("mousemove labelTooltip.hide(); labelPersistTrigger=false")
                labelTooltip.hide();
                window.labelPersistTrigger=false;
                }
              })

          var tipLink = d3tip()
              .attr('class', 'd3-tip-link')
              .offset([-10, 0])
              .html(function(d) {
                return "<div><strong>Similarity</strong> <span>" + d.Similarity + "</span></div>";
              });

          // node distance scale
          var distanceScale =  d3.scale.linear()
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
            .linkDistance(scope.panel.linkDistance)
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
          var myPatentLabel={};

          var drag = force.drag()
              .on("dragstart", dragstart);

          var node = chart.selectAll('.node')
              .data(scope.data.nodes)
              .enter().append('g')
              .attr('class', function(d){
                var nodeClass='node';
                scope.filteredValue.forEach(function(filter){
                  var nodeClusters=d.value.split("/");
                  var nodeClustersFilters=filter.split("/");
                  if(nodeClusters.length>nodeClustersFilters.length && d.value.includes(filter)){
                    nodeClass="node3";
                    return;
                  }
                });

                if(scope.filteredValue.includes(d.value)){
                  nodeClass='node2';
                }
                return nodeClass;
              })
              .call(drag);

          node
              .attr("transform", function(d){
                return "translate("+d.x+","+d.y+")";
              })
              .on('click', function(d){

                if(justClickFlag && d3.event.target.className.baseVal =='bubble' && !d3.event.target.parentNode.className.baseVal.includes('node2')){
                  tipLink.hide();
                  clusterTooltip.hide();
                  filterDialogSrv.addMode('or');
                  filterDialogSrv.showDialog(scope.panel.nodeSearch,d.name || d.value);
                } else if(justClickFlag && d3.event.target.className.baseVal =='bubble' && d3.event.target.parentNode.className.baseVal.includes('node2')){
                  tipLink.hide();
                  clusterTooltip.hide();
                  filterDialogSrv.addMode('or');
                  filterDialogSrv.showDialog(d.field,d.name || d.value);
                }
                d3.event.stopPropagation();
                d3.event.preventDefault();
              })

              .on('mouseover', function(data,event){
                  var targetEvent=d3.event.target;
                  if(d3.event.target.className.baseVal.indexOf('bubble') !=-1 && !window.labelPersistTrigger){
                        labelTooltip.hide();
                        !mouseDownFlag && clusterTooltip
                                            .setDirectionByTarget(d3.event)
                                            .show(data,targetEvent);
                  }

                  //console.log(data);
                  scope.stopFlag=true;
                  force.stop();
                })
                .on('mouseout', function(){
                  clusterTooltip.hide();
                  scope.stopFlag=false;
                  force.start();
                })
                .on("mousedown", function(d) {
                  clusterTooltip.hide();
                  mouseDownFlag=true;
                  justClickFlag=true;
                  d3.event.stopPropagation();
                  d3.event.preventDefault();
                });

            function dragstart(d) {
              d3.select(this).classed("fixed", d.fixed = true);
            }


            node.append('circle')
                .attr('r', function(d){
                  return nodeSize(d.count);
                })
                .attr('class','bubble')


            labelText(patentDescription,node,scope,dashboard);

            svg.call(tipLink);
            svg.call(clusterTooltip);
            svg.call(labelTooltip);
            svg.call(zoom);

            zoom.on("zoom", function() {
                          chart.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
            });

              force.on("tick", function() {
                // if(!scope.stopFlag){

                node.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });


              link.attr("x1", function(d) { return d.source.x; })
                .attr("y1", function(d) { return d.source.y; })
                .attr("x2", function(d) { return d.target.x; })
                .attr("y2", function(d) { return d.target.y; });

              node.attr("cx", function(d) { return d.x; })
                .attr("cy", function(d) { return d.y; });

          });

          force.start();
    }
  }};
});
});
