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
  'palettejs'
],
function (angular, app, _, $, d3, d3tip,palette) {
  'use strict';

  var debug = function(message){
    var ACTIVE=false;
    if(ACTIVE){
      console.log(message);
    }
  };



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
      show_queries: true,
      number_mode: "F"
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

    $scope.build_search = function(word) {
      if(word) {
        filterSrv.set({type:'terms',field:$scope.panel.field2,value:word,mandate:'must'});
      } else {
        return;
      }
      dashboard.refresh();
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
      var rows_limit = '&rows=' +$scope.panel.max_number_r;
      //var pivot_field = '&facet=true&facet.pivot=' + $scope.panel.field1 +","+$scope.panel.field2;
      var facet_fields = '&facet.field=' + $scope.panel.field1 +"&facet.field=" +$scope.panel.field2;
      var facet_limit="&facet.limit="+$scope.panel.max_number_r;
      var pivot_field="&facet=true&json.facet={top_field1:{type: terms,field: "+$scope.panel.field1+",allBuckets:true,numBuckets:true,limit:"+$scope.panel.max_number_r+",facet:{top_field2:{type : terms,field: "+$scope.panel.field2+",limit:"+$scope.panel.max_number_r+",allBuckets:true,numBuckets:true}}}}";


      $scope.panel.queries.query = querySrv.getQuery(0) + fq + pivot_field +facet_fields+facet_limit+ wt + rows_limit;

      //facet=true&stats=true&facet.field=cluster_h&stats.field=escluster_str_patent_codes&stats.field=cluster_h&facet.field=escluster_str_patent_codes&stats.calcdistinct=true

      //facet=true&json.facet={categories:{type:terms,field:cluster_h,limit:3,numBuckets:true}}

      //facet=true&json.facet={top_field1:{type: terms,field: cluster_h,allBuckets:true,numBuckets:true,facet:{top_field2:{type : terms,field: escluster_str_patent_codes,limit:5,allBuckets:true,numBuckets:true}}}}

      //facet=true&json.facet={top_escluster_str_patent_codes:{type: terms,field: escluster_str_patent_codes,allBuckets:true,numBuckets:true,facet:{top_cluster_h:{type : terms,field: cluster_h,limit:5,allBuckets:true,numBuckets:true}}}}

      /*
      "facets": {
         "count": 497,
         "top_cluster_h": {
           "numBuckets": 19,
           "allBuckets": {
             "count": 497
           },
           "buckets": [
             {
               "val": "b60c1_00,b65d51_24,b24b9_10,a24f47_00,c03b37_018,b65g49_06,b65d49_00,c04b18_02,b08b3_08,b60j7_043",
               "count": 123,
               "top_escluster_str_patent_codes": {
                 "numBuckets": 233,
                 "allBuckets": {
                   "count": 249
                 },
    */


      // Set the additional custom query
      if ($scope.panel.queries.custom != null) {
          request = request.setQuery($scope.panel.queries.query + $scope.panel.queries.custom);
      } else {
          request = request.setQuery($scope.panel.queries.query);
      }



      // Execute the search and get results
      var results = request.doSearch();

      // Populate scope when we have results
      results.then(function(results) {
          $scope.data = {};
          // var range1set=new Set();
          // var range2set=new Set();
        // var parsedResults = d3.json.parse(results, function(d) {

          $scope.data = {range1:[],range2:[],values:[],field1stat:{tot_docs:0,field_count:0}};

          // $scope.data.range2 = results.facet_counts.facet_fields[$scope.panel.field2].filter(function(val,index){ if((index+1) % 2){ return val;}});
          // debug("range2:"+  $scope.data.range2);
          //-->
          //$scope.data.values = d3.values(results.facet_counts.facet_pivot[$scope.panel.field1+","+$scope.panel.field2]);
          //-->
          //list di tutti i cluster
          $scope.data.values = d3.values(results.facets['top_field1'].buckets);
          $scope.data.field1stat.tot_docs=results.facets['top_field1'].allBuckets.count;
          $scope.data.field1stat.field_count=results.facets['top_field1'].numBuckets;

          $scope.addToSet=function(set,val){
              return set.add(val.val);
          };

          $scope.flatNestedArray=function(array,curr){
              return array.concat(curr['top_field2'].buckets);
          };

          //range first field (cluster)
          $scope.data.range1 =  Array.from(
            $scope.data.values.reduce($scope.addToSet,new Set())
              );


          //range second field (patent)
          $scope.data.range2 =  Array.from(
              $scope.data.values
                .reduce($scope.flatNestedArray,[])
                .reduce($scope.addToSet,new Set())
          );


            debug("data:"+results);
            debug("panale field1:"+$scope.panel.field1);
            debug("panale field2:"+$scope.panel.field2);
            debug("values:"+  $scope.data.values);
            debug("range1:"+  $scope.data.range1);
            debug("range2:"+  $scope.data.range2);

          $scope.render();
      });

      // Hide the spinning wheel icon
      $scope.panelMeta.loading = false;

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

          var margin = {top: 30, right: 30, bottom: 50, left: 30};

          var panel_width = element.parent().width(),
              panel_height = parseInt(scope.row.height),
              width = panel_width - (margin.right + margin.left),
              height = panel_height - (margin.top + margin.bottom);
//              barHeight = height / scope.data.length;
              debug("height:"+height);
              debug("width"+ width );

          // var x = d3.scale.linear()
          //           .domain([0, d3.max(scope.data)])
          //           .range([0, width]);


//ordial1 (yaer)
          var x = d3.scale.ordinal()
            .domain(scope.data.range1)
            .rangeRoundBands([0, width],0.1);


//ordila2 (cluster)
          // var x1 = d3.scale.ordinal()
          //     .domain(scope.data.range2)
          //     .rangeRoundBands([0, x.rangeBand()],0.05);

//conteggio
          var y = d3.scale.linear()
              .domain([0,d3.max(
                scope.data.values,
                function(d) {
                  /*
                  debug("array to max evaluate");
                  debug(d);
                  */
                  return d3.max(d.top_field2.buckets, function(obj) {
                    /*
                    debug("object to count");
                    debug(obj.count);
                    */
                    return obj.count;
                  });
                  }
                )]).nice()
              .rangeRound([ height,0]);


/* total value of field1*/

          var totalY =  d3.scale.linear()
                              .domain([0,d3.max(scope.data.values,function(d){
                                          return d.count;
                                      })])
                              .rangeRound([ height,0]);


//anni
          //console.log(palette('tol-rainbow', 10).map(function(a){return "#"+a}));

        var z = d3.scale.ordinal()
            .range(palette('tol-rainbow', scope.data.range2.length).map(function(a){return "#"+a;}));

          var xAxis=d3.svg.axis().scale(x)
          .orient("bottom")
          .tickFormat(function(d,i) {
            i;
            return d.substr(0,4);
          });

          var yAxis=d3.svg.axis().scale(y)
          .orient("left")
          .ticks(null, "s");




          var svg = d3.select(element[0]).append('svg')
                        .attr('width', panel_width)
                        .attr('height', panel_height);

          var chart= svg.append("g").attr("transform", "translate("+margin.left+","+margin.top+")");
          svg.append("text")
               .attr("transform","translate(" + (width/2) + " ," + (height + margin.top + 30) + ")")
               .attr("dy", "0.32em")
               .attr("fill", "#000")
               .attr("font-weight", "bold")
               .attr("text-anchor", "start")
               .text("Clusters");

          var zoom=d3.extensions.zoomBounded()
                              .scaleExtent([1, width])
                              .setXaxis(x)
                              .onZoom(function(translate){
                                draw(d3.event.scale,translate);
                                tipField1.hide();
                                tipField2.hide();
                              });
                              //.on("zoom", zoomed);

          svg.call(zoom);

          var tipField1 = d3tip()
              .attr('class', 'd3-tip')
              .offset([-10, 0])
              .html(function(p) {
                  var patent_number;
                  if(scope.panel.number_mode==="F"){
                    patent_number="<div><strong>Patents </strong> <span style='color:red'>" + p.count + "</span></div>";
                  }else{
                    patent_number="<div><strong>Patents percentage</strong> <span style='color:red'>" + ((p.count/scope.data.field1stat.tot_docs)*100).toFixed(2)  + "%</span></div>";
                  }

                  return "<div><strong>Cluster name</strong> <span style='color:red'>" + p.val.substr(0,12)+ "</span></div>"+
                  patent_number+
                  "<div><strong>Unique patent category</strong> <span style='color:red'>" + this.__data__.top_field2.numBuckets + "</span></div>"+
                  "<div><strong>Patent category</strong> <span style='color:red'>" + this.__data__.top_field2.allBuckets.count + "</span></div>"+
                  "<hr>"+
                  "<h4>Total</h4>"+
                  "<div><strong>Cluster</strong> <span style='color:red'>" + scope.data.field1stat.field_count + "</span></div>"+
                  "<div><strong>Patents</strong> <span style='color:red'>" + scope.data.field1stat.tot_docs + "</span></div>";
              });

          var tipField2 = d3tip()
              .attr('class', 'd3-tip')
              .offset([-10, 0])
              .html(function(d) {
                  var tipField2;
                  if(scope.panel.number_mode==="F"){
                    tipField2="<div><strong>Patents</strong> <span style='color:red'>" + d.count + "</span></div>";
                  }else{
                    tipField2="<div><strong>Patents percentage</strong> <span style='color:red'>" + ((d.count/this.parentNode.__data__.top_field2.allBuckets.count)*100).toFixed(2) + "%</span></div>";
                  }
                  return "<div><strong>Patent category name:</strong> <span style='color:red'>" + d.val + "</span></div>"+
                  tipField2;
              });

          var draw = function(scale,translateX,translateY){

            scale=scale || 1;
            translateX= translateX || 0;
            translateY= translateY || 0;

          chart.remove();
          chart=svg.append("g").attr("transform", "translate("+ (translateX+margin.left)+","+(translateY+margin.top)+")");

          var field1Block=chart.selectAll("g")
            .data(scope.data.values)
            .enter().append("g")
              .attr("transform", function(d) {
                debug(d.val);
                return "translate(" + x(d.val) + ",0)";
              });

          field1Block.selectAll("rect")
            .data(function(d) {
              debug("cluster data selected:");
              debug(d);
              var range =  Array.from(d.top_field2.buckets.reduce(scope.addToSet,new Set()));

              d.newScale = d3.scale.ordinal()
                  .domain(range)
                  .rangeRoundBands([0, x.rangeBand()],0.1);




              return d['top_field2'].buckets;
            })
            .enter().append("rect")
              .attr("x", function(d) {
                debug("x rect:"+d.val);
                debug("x rect coded:"+this.parentNode.__data__.newScale(d.val));
                return this.parentNode.__data__.newScale(d.val);
              })
              .attr("y", function(d) {
                return y(d.count);
              })
              .attr("width", function(){return this.parentNode.__data__.newScale.rangeBand();})
              .attr("height", function(d) {
                debug("object to draw");
                debug(d);
                debug("height calculation");
                debug("height:"+height);
                debug("d.value:"+d.count);
                debug(" y(d.value):"+ y(d.count));
                debug("eventualy y value:"+ height - y(d.count));

                return height - y(d.count);
              })
              .attr("fill", function(d) {
                debug("color number:"+d.val);
                debug("color code"+z(d.val));
                return z(d.val);
              })
              .on('mouseover', tipField2.show)
              .on('mouseout', tipField2.hide)
              .on('click', function(d){ tipField2.hide(); scope.build_search(d.val);});



          field1Block.selectAll("circle")
            .data(function(d){
              return new Array(d);
            })
            .enter()
            .append("circle")
            .attr("class","field1total")
            .attr("cx",function(){
              debug("x value"+x.rangeBand()/2);
              return (x.rangeBand()/2);
              })
              .attr("cy",function(d){
                return totalY(d.count);
              })
            .on('mouseover', tipField1.show)
            .on('mouseout', tipField1.hide);


          chart.call(tipField1);
          chart.call(tipField2);

          chart.append("g")
              .attr("class", "axis x")
              .attr("transform", "translate(0," + height + ")")
              .call(xAxis);



          chart.append("g")
              .attr("class", "axis y")
              .call(yAxis)
            .append("text")
              .attr("x", -30)
              .attr("y", y(y.ticks().pop()) + -20)
              .attr("dy", "0.32em")
              .attr("fill", "#000")
              .attr("font-weight", "bold")
              .attr("text-anchor", "start")
              .text("Patents");
          };

          draw();


          // var legend = chart.append("g")
          //     .attr("font-family", "sans-serif")
          //     .attr("font-size", 10)
          //     .attr("text-anchor", "end")
          //   .selectAll("g")
          //   .data(scope.data.range2)
          //   .enter().append("g")
          //     .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });
          //
          // legend.append("rect")
          //     .attr("x", width - 19)
          //     .attr("width", 19)
          //     .attr("height", 19)
          //     .attr("fill", z);
          //
          // legend.append("text")
          //     .attr("x", width - 24)
          //     .attr("y", 9.5)
          //     .attr("dy", "0.32em")
          //     .text(function(d) { return d; });
    }
  }};
});
});
