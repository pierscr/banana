define([
    'angular',
    'config',
    'underscore',
    'services/all'
],
function (angular, config, _) {
    "use strict";

    var module = angular.module('kibana.controllers');

    module.controller('DashCtrl', function ($scope, $route, ejsResource, sjsResource, fields, dashboard, alertSrv, panelMove,relatedDashboardSrv) {
        $scope.editor = {
            index: 0
        };

        // For moving stuff around the dashboard. Needs better names
        $scope.panelMove = panelMove;
        $scope.panelMoveDrop = panelMove.onDrop;
        $scope.panelMoveStart = panelMove.onStart;
        $scope.panelMoveStop = panelMove.onStop;
        $scope.panelMoveOver = panelMove.onOver;
        $scope.panelMoveOut = panelMove.onOut;
        $scope.relatedDashboardfields= [];

        $scope.init = function () {
            $scope.config = config;
            // Make underscore.js available to views
            $scope._ = _;
            $scope.dashboard = dashboard;
            $scope.dashAlerts = alertSrv;
            alertSrv.clearAll();

            // Provide a global list of all see fields
            $scope.fields = fields;
            $scope.reset_row();

            $scope.reset_related_dashboard();
            // Solr
            $scope.ejs = ejsResource(config.elasticsearch);
            $scope.sjs = sjsResource(config.solr + config.solr_core);
        };

        $scope.backToDashboard=function(idx){
          relatedDashboardSrv.backToDashboard(idx);
        }

        $scope.isPanel = function (obj) {
            if (!_.isNull(obj) && !_.isUndefined(obj) && !_.isUndefined(obj.type)) {
                return true;
            } else {
                return false;
            }
        };

        $scope.add_row = function (dash, row) {
            dash.rows.push(row);
        };

        $scope.reset_row = function () {
            $scope.row = {
                title: '',
                height: '150px',
                editable: true,
            };
        };

        $scope.add_relatedDashboard = function (related_dashboard, new_dashboard) {
            related_dashboard.push(new_dashboard);
        };

        $scope.reset_related_dashboard= function () {
            $scope.relatedDashboard = {
                label: '',
                dashboard:'',
                fieldin: '',
                fieldout:''
            };
        };

        $scope.getRelatedFields=function(){
          dashboard.elasticsearch_load('nochange', $scope.relatedDashboard.dashboard,"nochange").success(function(data){
            fields.map(data.solr.core_name).then(function (result) {
              var obj=result["logstash-2999.12.31"]["logs"]
              $scope.relatedDashboardfields= Object.keys(obj);
            });
          })

        }


        // $scope.dashboards=dashboard.dashboard_list.map(x=>x.id);

        $scope.row_style = function (row) {
            return {'min-height': row.collapse || row.fixed? '5px' : row.height};
        };

        $scope.edit_path = function (type) {
            if (type) {
                return 'app/panels/' + type + '/editor.html';
            } else {
                return false;
            }
        };

        $scope.setEditorTabs = function (panelMeta) {
            $scope.editorTabs = ['General', 'Panel', 'Info'];
            if (!_.isUndefined(panelMeta.editorTabs)) {
                $scope.editorTabs = _.union($scope.editorTabs, _.pluck(panelMeta.editorTabs, 'title'));
            }
            return $scope.editorTabs;
        };

        // This is whoafully incomplete, but will do for now
        $scope.parse_error = function (data) {
            var _error = data.match("nested: (.*?);");
            return _.isNull(_error) ? data : _error[1];
        };

        $scope.init();
    });
});
