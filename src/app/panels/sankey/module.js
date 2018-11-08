define(['angular','d3','app','d3-sanky'],function(angular,d3,app,d3sanky){
  'use strict';

  var module = angular.module('kibana.panels.sankey', []);
  app.useModule(module);

  module.controller('sankey',function($scope, dashboard, querySrv, $http) {
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
      description: 'Sanky chart'
    };

    $scope.init = function() {
      $scope.$on('refresh',function(){
        $scope.get_data();
      });
      $scope.get_data();
    };


    $scope.get_data=function(){
      $http({
        method: 'GET',
        url: 'example_data/sankey_example_custom0.json'
      }).then(function(results) {
        $scope.data=results.data;
        $scope.$emit('render');
      },function(){
        alert("error");
      });
    };
  });

  module.directive('sankeyChart',function(){
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

        function render_panel() {
          // Clear the panel
          element.html('');


          var colorSchema = d3.scale.category10();

          var color = function(name){
            return colorSchema(name.replace(/ .*/, ""));
          };

          var format = function(d){
            var f = d3.format(",.0f");
            return f(d)+"TWh";
          };

          var heightReg=/([0-9]+)px/g;

          var width=element.parent().width();
          var height=Number(heightReg.exec(scope.row.height)[1]);

          var sankey = d3sanky.sankey()
              .nodeWidth(15)
              .nodePadding(10)
              .extent([[1, 1], [width - 1, height - 5]]);


          var dati=sankey({
                    nodes: scope.data.nodes.map(function(d){ return Object.assign({}, d);}),
                    links: scope.data.links.map(function(d){ return Object.assign({}, d);})
                  });



          var nodes=dati.nodes;
          var links=dati.links;

          var edgeColor = "input" ;

          var chart = d3.select(element[0]).append('svg')
                        .attr('width', element.parent().width())
                        .attr('height', scope.row.height);

        chart.append("g")
                  .attr("stroke", "#000")
                  .selectAll("rect")
                  .data(nodes)
                  .enter().append("rect")
                    .attr("x", function(d){return d.x0;})
                    .attr("y", function(d){return d.y0;})
                    .attr("height", function(d){return d.y1 - d.y0;})
                    .attr("width", function(d){return d.x1 - d.x0;})
                    .attr("fill", function(d){return color(d.name);})
                  .append("title")
                    .text(function(d){return d.name+"\n"+format(d.value);});

                var link = chart.append("g")
                    .attr("fill", "none")
                    .attr("stroke-opacity", 0.5)
                  .selectAll("g")
                  .data(links)
                  .enter().append("g")
                    .style("mix-blend-mode", "multiply");

                if (edgeColor === "path") {
                  var gradient = link.append("linearGradient")
                      .attr("gradientUnits", "userSpaceOnUse")
                      .attr("x1", function(d){return d.source.x1;})
                      .attr("x2", function(d){return d.target.x0;});

                  gradient.append("stop")
                      .attr("offset", "0%")
                      .attr("stop-color", function(d){return color(d.source.name);});

                  gradient.append("stop")
                      .attr("offset", "100%")
                      .attr("stop-color", function(d){return color(d.target.name);});
                }

                link.append("path")
                    .attr("d", d3sanky.sankeyLinkHorizontal())
                    .attr("stroke", function(d){
                      return  edgeColor === "path" ? d.uid
                        : edgeColor === "input" ? color(d.source.name)
                        : color(d.target.name);
                      })
                    .attr("stroke-width", function(d){
                      return Math.max(1, d.width);
                    });

                link.append("title")
                    .text(function(d){return d.source.name+"\n"+d.target.name+"\n"+format(d.value);});

                chart.append("g")
                    .style("font", "10px sans-serif")
                  .selectAll("text")
                  .data(nodes)
                  .enter().append("text")
                    .attr("x", function(d){return d.x0 < width / 2 ? d.x1 + 6 : d.x0 - 6;})
                    .attr("y", function(d){return ((d.y1 + d.y0) / 2);})
                    .attr("dy", "0.35em")
                    .attr("text-anchor", function(d) {return  d.x0 < width / 2 ? "start" : "end"; })
                    .text(function(d){return d.name;});

        }

      }
    };
  });


});
