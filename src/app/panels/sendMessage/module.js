define([
  'angular',
  'app',
  'underscore',
  'require'
],
function (angular, app, _, require) {
  'use strict';

  var module = angular.module('kibana.panels.sendMessage', []);
  app.useModule(module);

  module.controller('sendMessage', function($scope,dashboard,filterSrv,$location,$http) {
    $scope.panelMeta = {
      status  : "Stable",
      description : "A static panel for send a message to remote host through a specified url"
    };

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


    $scope.sendMessage = function(title,description) {
      var fwdParameters=$location.search();
      var data=fwdParameters;
      data.title=title;
      data.description=description;
      //filterSrv.removeAll();
      $http.post($scope.panel.url, data).then(function successCallback(response) {
          if(response==undefined){
            $scope.panel.response="Send data error ";
          }else{
            if(response.status=200){
              console.log("send message done");
              $scope.panel.response="Data sent";
            }else{
              $scope.panel.response="Send data error ";
            }
          }
        }, function errorCallback(response) {
          console.log("error");
          $scope.response="Send data error ";
        });
      $scope.response="Send data error ";
      dashboard.refresh();
    }

      $scope.add_facet_field = function(field) {
        if ( _.indexOf($scope.panel.fields, field) === -1 && $scope.panel.fields.length < $scope.panel.maxnum_facets) {
          $scope.panel.fields.push(field);
        }
      };

      $scope.remove_facet_field = function(field) {
        if ( _.indexOf($scope.panel.fields, field) > -1) {
          $scope.panel.fields = _.without($scope.fields, field);
        }
      };

      $scope.init= function(){
        $scope.panel.response="";
        $scope.panel.messagetitle="";
        $scope.panel.description="";        
    };
  });
});
