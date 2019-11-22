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

    function checkParameter(tot,expectedItem){
      var fwdParameters =  $location.search();
      for(var item in fwdParameters){
        if(expectedItem == item)
          return tot;
      }
      tot.push(expectedItem);
      return tot
    }

    function addParameter(tot,expectedItem){
      var fwdParameters =  $location.search();
      for(var item in fwdParameters){
        if(expectedItem == item){
          tot[item]=fwdParameters[item];
          return tot;
        }
      }
    }


    $scope.sendMessage = function (title, description) {
      var fwdParameters = $location.search();

      var checkResult=$scope.panel.fields.reduce(checkParameter,[]);
      if(checkResult.length>0){
        console.log('the follow parameters need to be passed with the request');
        console.log(checkResult);
        $scope.panel.response = 'you need to reopen the visualization tool by  the collective intelligence link';
        return;
      }
      var data = $scope.panel.fields.reduce(addParameter,{});;
      data.title = title;
      data.description = description;
      var 	wrappedJson={"/pythia-challenge62-portlet.clsidea/addIdea":{"ideaParameters":[]}};
      wrappedJson["/pythia-challenge62-portlet.clsidea/addIdea"]["ideaParameters"].push(JSON.stringify(data));
      //filterSrv.removeAll();
      $http.post($scope.panel.url, wrappedJson).then(function successCallback(response) {
        if (response == undefined) {
          console.log('the server is not reachable , possible cors problems');
          $scope.panel.response = 'Send data error - check the connection and console log';
        } else {
          if (response.status == 200) {
            if(response.data.success == true){
              console.log('send message done');
              $scope.panel.response = 'Data have been sent to the collective intelligence platform';
            }else{
              console.log('send message error');
            $scope.panel.response = response.data.message!=""?response.data.message:'Send data error ';
            }
          } else {
            console.log('send message error');
            $scope.panel.response = 'Send data error ';
          }
        }
      }, function errorCallback(response) {
        console.log('error');
        $scope.response = 'Send data error ';
      });
      $scope.response = 'Send data error ';
      dashboard.refresh();
    };

      $scope.add_facet_field = function(field) {
        if ( _.indexOf($scope.panel.fields, field) === -1 && $scope.panel.fields.length < $scope.panel.maxnum_facets) {
          $scope.panel.fields.push(field);
        }
      };

      $scope.remove_facet_field = function(field) {
        if ( _.indexOf($scope.panel.fields, field) > -1) {
          $scope.panel.fields = _.without($scope.panel.fields, field);
        }
      };

      $scope.init= function(){
        $scope.panel.response="";
        $scope.panel.messagetitle="";
        $scope.panel.description="";
    };
  });
});
