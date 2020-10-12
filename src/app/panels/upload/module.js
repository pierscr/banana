/*

 ## Hits

 ### Parameters
 * style :: A hash of css styles
 * arrangement :: How should I arrange the query results? 'horizontal' or 'vertical'
 * chart :: Show a chart? 'none', 'bar', 'pie'
 * donut :: Only applies to 'pie' charts. Punches a hole in the chart for some reason
 * tilt :: Only 'pie' charts. Janky 3D effect. Looks terrible 90% of the time.
 * lables :: Only 'pie' charts. Labels on the pie?

 */
define([
    'angular',
    'app',
    'underscore',
    'jquery',
    'kbn',

    'jquery.flot',
    'jquery.flot.pie'
], function (angular, app, _, $, kbn) {
    'use strict';

    var module = angular.module('kibana.panels.upload', []);
    app.useModule(module);

    module.controller('upload', function ($scope,$location,$http,FileUpload) {
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
            description: "Showing stats like count, min, max, and etc. for the current query including all the applied filters."
        };

        // Set and populate defaults
        var _d={
          titolo:"titolo nello scope",
          maxnum_facets:11,
          fields:[],
          url:$location.host()+":"+$location.port(),
          messagetitle:"",
          description:"",
          resultMessage:"",
          button_name:""
        };

        _.defaults($scope.panel, _d);

        $scope.init = function () {

        };

        $scope.add = function() {

          var params = {};
          params.url=$scope.panel.url;
          params.commitWithin=1000;
          params.core="defence_system_v2";
          params.handler="update";
          params.overwrite=true;
          params.raw="&f.manufacturer_company.separator=%3B&f.manufacturer_company.split=true&f.country_of_origin.separator=%3B&f.country_of_origin.split=true&f.eu_member_states_that_use_the_defence_system.separator=%3B&f.eu_member_states_that_use_the_defence_system.split=true&f.eu_member_states_that_produce_partially_the_non_eu_defence_system.separator=%3B&f.eu_member_states_that_produce_partially_the_non_eu_defence_system.split=true&f.alternative_defence_systems.separator=%3B&f.alternative_defence_systems.split=true&f.regulation.separator=%3B&f.regulation.split=true";
          params.wt="json";
          FileUpload.upload(params, $scope.fileUpload, function (success) {
              $scope.responseStatus = "success";
              $scope.response = JSON.stringify(success, null, '  ');
          }, function (failure) {
              $scope.responseStatus = "failure";
              $scope.response = JSON.stringify(failure, null, '  ');
          });
            // var f = document.getElementById('file').files[0],
            //     r = new FileReader();
            //
            // r.onloadend = function(e) {
            //   var data = e.target.result;
            //   //send your binary data via $http or $resource or do anything else with it
            //   $http.post($scope.panel.url, data,{ headers: {'Content-Type': 'multipart/form-data'}},{ params: JSON.parse("{\"commitWithin\":\"1000\",\"overwrite\":\"true\",\"wt\":\"json\",\"f.manufacturer_company.separator\":\"%3B&\",\"f.manufacturer_company.split\":\"true\"}")})
            //     .then(function successCallback(response) {
            //     if (response == undefined) {
            //       console.log('the server is not reachable , possible cors problems');
            //       $scope.response = 'Send data error - check the connection and console log';
            //     } else {
            //       if (response.status == 200) {
            //         if(response.data.success == true){
            //           console.log('send message done');
            //           $scope.response = 'Data have been sent to the collective intelligence platform';
            //         }else{
            //           console.log('send message error');
            //         $scope.response = response.data.message!=""?response.data.message:'Send data error ';
            //         }
            //       } else {
            //         console.log('send message error');
            //         $scope.response = 'Send data error ';
            //       }
            //     }
            //   }, function errorCallback(response) {
            //     console.log('error');
            //     $scope.response = 'Send data error ';
            //   });
            // }
            //
            // r.readAsBinaryString(f);

        }



    });

    module.directive('fileModel', function ($parse) {
      return {
          restrict: 'A',
          link: function(scope, element, attrs) {
              var model = $parse(attrs.fileModel);
              var modelSetter = model.assign;

              element.bind('change', function(){
                  scope.$apply(function(){
                      modelSetter(scope, element[0].files[0]);
                  });
              });
          }
      };
  });
});
