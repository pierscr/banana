/*

 ## bubbleheatmap Panel

 */
define([
    'angular',
    'app',
    'underscore',
    'jquery',
    'd3',
    'crossProduct',
    'dataFacetRetrieval'
], function (angular, app, _, $, d3,crossProduct,dataFacetRetrieval) {
    'use strict';

    var module = angular.module('kibana.panels.bubbleheatmap', []);
    app.useModule(module);

    module.controller('bubbleheatmap', function ($scope, $timeout, timer, dashboard, querySrv, filterSrv) {
        $scope.panelMeta = {
            modals: [{
                description: "Inspect",
                icon: "icon-info-sign",
                partial: "app/partials/inspector.html",
                show: $scope.panel.spyable
            }],
            editorTabs: [{
                title: 'Queries',
                src: 'app/partials/querySelect.html'
            }],
            status: "Stable",
            description: "This panel helps you to plot a bubble bubbleheatmap between two to four variables."
        };

        // default values
        var _d = {
            queries: {
                mode: 'all',
                ids: [],
                query: '*:*',
                custom: ''
            },
            max_rows: 1000, // maximum number of rows returned from Solr
            xaxis: '',
            yaxis: '',
            xaxisLabel: '',
            yaxisLabel: '',
            colorField: '',
            bubbleSizeField: '',
            spyable: true,
            show_queries: true,
            agg_function_: "avg",
            filterValue:0,
            refresh: {
                enable: false,
                interval: 2
            },
            marginTop: 20,
            marginRight: 20,
            marginBottom: 100,
            marginLeft: 50
        };

        _.defaults($scope.panel, _d);

        $scope.init = function () {
            // Start refresh timer if enabled
            if ($scope.panel.refresh.enable) {
                $scope.set_timer($scope.panel.refresh.interval);
            }

            $scope.$on('refresh', function () {
                $scope.get_data();
            });
            $scope.get_data();
        };

        $scope.set_timer = function (refresh_interval) {
            $scope.panel.refresh.interval = refresh_interval;
            if (_.isNumber($scope.panel.refresh.interval)) {
                timer.cancel($scope.refresh_timer);
                $scope.realtime();
            } else {
                timer.cancel($scope.refresh_timer);
            }
        };

        $scope.realtime = function () {
            if ($scope.panel.refresh.enable) {
                timer.cancel($scope.refresh_timer);

                $scope.refresh_timer = timer.register($timeout(function () {
                    $scope.realtime();
                    $scope.get_data();
                }, $scope.panel.refresh.interval * 1000));
            } else {
                timer.cancel($scope.refresh_timer);
            }
        };

        $scope.get_data = function () {

                 $scope.data=[];

                var createFn=function(obj){
                  var result={};
                  result[$scope.panel.xaxis]=obj[0].val;
                  result[$scope.panel.yaxis]=obj[1].val;
                  var first=Math.pow(obj[0][$scope.panel.bubbleSizeField], 2);
                  var second=Math.pow(obj[1][$scope.panel.bubbleSizeField], 2);
                  result.score=Math.sqrt((first+second)/2);
                  return result;
                }

                var filterFn=function(obj){
                  return obj.score>$scope.panel.filterValue ;
                }


                var addFn=function(ob1,ob2){
                  ob1.score=ob1.score+ob2.score;
                  var tech=[];
                  ob1.tech_s= tech.concat(ob1.tech_s,ob2.tech_s);
                  return ob1;
                }

                dataFacetRetrieval(["tech_s","dim_s","macro_s"],$scope,dashboard,filterSrv,querySrv,
                  function(results){
                      console.log(results);
                    //$scope.data=basicFacetParser(["tech_s","dim_s","macro_s"],results);
                    var techArray=results.facets["tech_s"].buckets;

                    techArray.forEach(function(elem){


                      var technology=elem.val;
                      var x_values=elem["dim_s"].buckets[0];
                      var y_values=elem["dim_s"].buckets[1];

                      var addFieldFn=function(obj){
                        return obj.tech_s=technology;
                      }

                      var checkUnique=function(obj){
                        return $scope.data.find(function(curr){
                          // return curr.risk===obj.risk &&
                          //       curr.int===obj.int
                          return false;
                        })
                      }

                    $scope.data=$scope.data.concat(crossProduct()
                        .setDebug(true)
                        .setLists(x_values["macro_s"].buckets,y_values["macro_s"].buckets)
                        .addFieldFn(addFieldFn)
                        .createFn(createFn)
                        .filterFn(filterFn)
                        .checkUniqueFn(checkUnique)
                        .addFn(addFn)
                        .build());

                    });

                    $scope.data=$scope.data.sort(function(a,b){
                      return b.score-a.score;
                    });
                    /*
                     $scope.data=[{dim1: 'Economic', dim2: 'Stragetic', score: 1.7999999523162842, nuovo: 'new field'},{dim1: 'Economic', dim2: 'tactical', score: 1.5999999642372131, nuovo: 'new field'}, {dim1: 'Economic', dim2: 'gran strategyc', score: 1.399999976158142, nuovo: 'new field'},{dim1: 'Economic', dim2: 'Operational', score: 1.199999988079071, nuovo: 'new field'}, {dim1: 'Environmental risks', dim2: 'Stragetic', score: 1.5999999642372131, nuovo: 'new field'}, {dim1: 'Environmental risks',dim2:'tactical', score: 1.399999976158142, nuovo: 'new field'}, {dim1: 'Environmental risks', dim2: 'gran strategyc', score: 1.199999988079071, nuovo: 'new field'}, {dim1: 'Environmental risks', dim2: 'Operational', score: 1, nuovo: 'new field'}, {dim1: 'Technological risks', dim2: 'Stragetic', score: 1.399999976158142, nuovo: 'new field'}, {dim1: 'Technological risks', dim2: 'tactical', score: 1.199999988079071, nuovo: 'new field'}, {dim1: 'Technological risks', dim2: 'granstrategyc', score: 1, nuovo: 'new field'}, {dim1: 'Technological risks', dim2: 'Operational', score: 0.800000011920929, nuovo: 'new field'}];
                    */

                  $scope.render();

                });

                // Hide the spinning wheel icon
                $scope.panelMeta.loading = false;
            };


        $scope.set_refresh = function (state) {
            $scope.refresh = state;
        };

        $scope.close_edit = function () {
            // Start refresh timer if enabled
            if ($scope.panel.refresh.enable) {
                $scope.set_timer($scope.panel.refresh.interval);
            }
            if ($scope.refresh) {
                $scope.get_data();
            }
            $scope.refresh = false;
            $scope.$emit('render');
        };

        $scope.render = function () {
            $scope.$emit('render');
        };

        $scope.populate_modal = function (request) {
            $scope.inspector = angular.toJson(JSON.parse(request.toString()), true);
        };

        $scope.pad = function (n) {
            return (n < 10 ? '0' : '') + n;
        };


    });

    module.directive('bubbleheatmap', function (dashboard, filterSrv,filterDialogSrv) {
        return {
            restrict: 'E',
            link: function (scope, element) {

                scope.$on('render', function () {
                    render_panel();
                });

                angular.element(window).bind('resize', function () {
                    render_panel();
                });

                // Function for rendering panel
                function render_panel() {
                    element.html("");
                    var el = element[0];
                    var parent_width = element.parent().width(),
                        height = parseInt(scope.row.height),
                        padding = 50;
                        var margin = {
                                top: scope.panel.marginTop,
                                right: scope.panel.marginRight,
                                bottom: scope.panel.marginBottom,
                                left: scope.panel.marginLeft
                            },
                        width = parent_width - margin.left - margin.right;

                    height = height - margin.top - margin.bottom;

                    // Scales
                    var color = d3.scale.category20();
                    var rScale;
                    if (scope.panel.bubbleSizeField) {
                        rScale = d3.scale.linear()
                            .domain(d3.extent(scope.data, function (d) {
                                return d.score;
                            }))
                            .range([3, 20])
                            .nice();
                    }
                    var x = d3.scale.ordinal()
                        .rangePoints([0,width - padding * 2]);
                    var y = d3.scale.ordinal()
                        .rangePoints([height, 0]);

                    x.domain(scope.data.map(function(d){return d[scope.panel.xaxis]}));
                    // x.domain(d3.extent(scope.data, function (d) {
                    //     return d[scope.panel.xaxis];
                    // }));

                    y.domain(scope.data.map(function(d){return d[scope.panel.yaxis]}));
                    // y.domain(d3.extent(scope.data, function (d) {
                    //     return d[scope.panel.yaxis];
                    // }));

                    var renderSinglePie=function(){
                        var pie = d3.layout.pie()
                            .value(function(d) {
                              return d.value;
                            })

                        var arc = d3.svg.arc()
                            .outerRadius(radius)

                        var myChart = d3.select('#chart').append('svg')
                            .attr('width', width)
                            .attr('height', height)
                            .append('g')
                            .attr('transform', 'translate('+(width-radius)+','+(height - radius)+')')
                            .selectAll('path').data(pie(piedata))
                            .enter().append('g')
                                .attr('class', 'slice')

                        var slices = d3.selectAll('g.slice')
                                .append('path')
                                .attr('fill', function(d,i) {
                                  return colors(i);
                                })
                                .attr('d', arc)

                        var text = d3.selectAll('g.slice')
                            .append('text')
                            .text(function(d,i) {
                                return d.data.label;
                            })
                            .attr('text-anchor', 'middle')
                            .attr('fill', 'white')
                            .attr('transform', function(d) {
                                d.innerRadius = radius/3;
                                d.outerRadius = radius;
                                return 'translate('+ arc.centroid(d)+')'
                            })
                      }

                    var svg = d3.select(el).append("svg")
                        .attr("width", width + margin.left + margin.right)
                        .attr("height", height + margin.top + margin.bottom)
                        .attr("viewBox", "0 0 " + parent_width + " " + (height + margin.top + margin.bottom))
                        .attr("preserveAspectRatio", "xMidYMid")
                        .append("g")
                        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

                    // add the tooltip area to the webpage
                    var $tooltip = $('<div>');


                    // Bubble
                    svg.selectAll(".dot")
                        .data(scope.data)
                        .enter().append("circle")
                        .attr("class", "dot")
                        .attr("r", function (d) {
                            if (scope.panel.bubbleSizeField) {
                                return rScale(d.score);
                            } else {
                                return 3;
                            }
                        })
                        .attr("cx", function (d) {
                            return x(d[scope.panel.xaxis]);
                        })
                        .attr("cy", function (d) {
                            return y(d[scope.panel.yaxis]);
                        })
                        .style("fill", function (d) {
                            return color(d[scope.panel.colorField]);
                        })
                        // .attr("fill-opacity","0.5")
                        .on("mouseover", function (d) {
                            var colorField = d[scope.panel.colorField] ? d[scope.panel.colorField] : "";
                            $tooltip
                                .html('<i class="icon-circle" style="color:' + color(d[scope.panel.colorField]) + ';"></i>' + ' ' +
                                    colorField + " (" + d[scope.panel.xaxis] + ", " + d[scope.panel.yaxis] + ")<br>Score:"+(d.score).toFixed(2))
                                .place_tt(d3.event.pageX, d3.event.pageY);
                        })
                        .on("mouseout", function () {
                            $tooltip.detach();
                        })
                        .on("click", function (d) {
                            if (scope.panel.colorField) {
                                filterDialogSrv.showDialog( scope.panel.colorField,d[scope.panel.colorField]);
                                $tooltip.detach();
                                dashboard.refresh();
                            }
                        });

                    if (scope.panel.colorField) {
                        var legend = svg.selectAll(".legend")
                            .data(color.domain())
                            .enter().append("g")
                            .attr("class", "legend")
                            .attr("transform", function (d, i) {
                                return 'translate('  + -margin.right +  ',' + ((i * 20 )- margin.top) +')';
                            })
                            .on("mouseover", function () {
                                el.style.cursor = 'pointer';
                            })
                            .on("mouseout", function () {
                                el.style.cursor = 'auto';
                            })
                            .on("click", function (d) {
                                filterSrv.set({
                                    type: 'terms',
                                    field: scope.panel.colorField,
                                    value: d,
                                    mandate: 'must'
                                });

                                el.style.cursor = 'auto';
                                dashboard.refresh();
                            });
                        legend.append("text")
                            .attr("x", width - 24)
                            .attr("y", 9)
                            .attr("dy", ".35em")
                            .style("text-anchor", "end")
                            .text(function (d) {
                                return d;
                            });
                        legend.append("rect")
                            .attr("x", width - 18)
                            .attr("width", 18)
                            .attr("height", 18)
                            .style("fill", color);
                    }

                    // Axis
                    var xAxis = d3.svg.axis()
                        .scale(x)
                        .orient("bottom");
                    var yAxis = d3.svg.axis()
                        .scale(y)
                        .orient("left");

                    // X-axis label
                    var xaxisLabel = '';
                    if (scope.panel.xaxisLabel) {
                        xaxisLabel = scope.panel.xaxisLabel;
                    } else {
                        xaxisLabel = scope.panel.xaxis;
                    }

                    svg.append("g")
                        .attr("class", "x axis")
                        .attr("transform", "translate(0," + height + ")")
                        .call(xAxis)
                        .append("text")
                        .attr("class", "label")
                        .attr("transform", "translate(" + ((width / 2) - margin.left + 30) + " ," + 50 + ")")
                        .style("text-anchor", "middle")
                        .text(xaxisLabel);

                    // Y-axis label
                    var yaxisLabel = '';
                    if (scope.panel.yaxisLabel) {
                        yaxisLabel = scope.panel.yaxisLabel;
                    } else {
                        yaxisLabel = scope.panel.yaxis;
                    }

                    svg.append("g")
                        .attr("class", "y axis")
                        .call(yAxis)
                        .append("text")
                        .attr("class", "label")
                        .attr("transform", "rotate(-90)")
                        .attr("y", 0 - margin.left)
                        .attr("x", 0 - ((height - margin.top - margin.bottom) / 2))
                        .attr("dy", ".71em")
                        .style("text-anchor", "end")
                        .text(yaxisLabel);
                }
            }
        };
    });
});
