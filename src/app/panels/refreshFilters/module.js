/*
  ## Text
  ### Parameters
  * mode :: 'text', 'html', 'markdown'
  * content :: Content of the panel
  * style :: Hash containing css properties
*/
define([
  'angular',
  'app',
  'underscore',
  'require'
],
function (angular, app, _, require) {
  'use strict';

  var module = angular.module('kibana.panels.refreshFilters', []);
  app.useModule(module);

  module.controller('refreshFilters', function($scope,dashboard,filterSrv) {
    $scope.panelMeta = {
      status  : "Stable",
      description : "A static panel for resetting dashboard"
    };

    $scope.refresh = function() {
      filterSrv.removeAll();
      dashboard.refresh();
    }

    $scope.init = function() {
      $scope.ready = false;
    };

  });

});
