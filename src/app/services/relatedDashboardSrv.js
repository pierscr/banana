define([
  'angular',
  'd3'
], function (angular,d3) {
  'use strict';

  var DEBUG = true; // DEBUG mode

  var module = angular.module('kibana.services');

  module.service('relatedDashboardSrv',function($q,dashboard, filterSrv,querySrv,solrSrv){

    var callback;
    var changeMode="this_tab";//"new_tab"
    var goToDashboard=function(targetDashboardLabel,field,value){
        console.log("go to this target dashboad: "+targetDashboardLabel );
        // reset
        querySrv.init();
        filterSrv.init();
        // set current
        var targetDashboardId=getRelatedDashboardId(targetDashboardLabel)
        setFiltersFromFiedlAndValue(targetDashboardId,field,value);
        switch (changeMode) {
          case "new_tab":
            goToDashboardNewTab(targetDashboardLabel);
            break;
          default:
            goToDashboardCurrentTab(targetDashboardLabel);
        }
    }

    var goToDashboardNewTab=function(targetDashboard){
      console.log("go to new dashboard new tab");
    }

    var goToDashboardCurrentTab=function(targetDashboardLabel){
      var targetDashboardId=getRelatedDashboardId(targetDashboardLabel);
      dashboard.elasticsearch_load("nofilters", targetDashboardId);
    }

    var getRelatedDashboardId=function(label){
      if(label==undefined){
        throw new Error('dashboard id of ad undefined label cannot be found');
      }
      var elem=dashboard.current.related_dashboard
        .find(function(elem){
          return elem.label==label;
        });
      if(elem!=undefined){
        return elem.dashboard;
      }else{
          throw new Error('dashboard with '+label+' label cannot be found');
      }
    }

    var getRelatedDashboardField=function(targetDashboardId,field){
      if(targetDashboardId==undefined || field==undefined){
        throw new Error('dashboard field out of ad undefined dashboad of fieldin id cannot be found');
      }
      var elem=dashboard.current.related_dashboard
        .find(function(elem){
          return elem.dashboard==targetDashboardId;
        });
      if(elem!=undefined){
        return elem.fieldout;
      }else{
          throw new Error('dashboard field out with dashboardid:'+targetDashboardId+' and fieldin:'+field+' cannot be found');
      }
    }

    var getRelatedDashboardByField=function(field,value){
      var dashboards=dashboard.current.related_dashboard.filter(function(elem){
        return field==elem.fieldin || field==elem.pivotfield;
      })
      if(dashboards!=undefined){
        return dashboards.map(x=>x.label);
      }
    }

    var setFiltersFromFiedlAndValue=function(targetDashboardId,field,value){
      if(getFieldIn(targetDashboardId)==field){
        filterSrv.set({type:'terms',field:getRelatedDashboardField(targetDashboardId,field),value:value,mandate:'must'});
        return;
      }
      var pivotField=getPivotField(targetDashboardId)
      if(pivotField!=undefined){
        filterSrv.set({type:'terms',field:field,value:value,mandate:'must'});
        solrSrv.getFacet(getFieldIn(targetDashboardId),100,function(fields){
          filterSrv.removeAll();
          fields[getFieldIn(targetDashboardId)].forEach(function(elem,index){
            index % 2 !== 0 || filterSrv.set({type:'terms',field:getRelatedDashboardField(targetDashboardId,field),value:elem,mandate:'either'});
          });
        });
      }
    }

    var getPivotField=function(targetDashboardId){
      if(targetDashboardId==undefined){
        throw new Error('dashboard field out of ad undefined dashboad of fieldin id cannot be found');
      }
      var elem=dashboard.current.related_dashboard
        .find(function(elem){
          return elem.dashboard==targetDashboardId;
        });
      if(elem!=undefined){
        return elem.pivotfield;
      }
    }

    var getFieldIn=function(targetDashboardId){
      var elem=dashboard.current.related_dashboard
        .find(function(elem){
          return elem.dashboard==targetDashboardId;
        });
      if(elem!=undefined){
        return elem.fieldin;
      }
    }

    return {
      goToDashboard:goToDashboard,
      getRelatedDashboardId:getRelatedDashboardId,
      getRelatedDashboardField:getRelatedDashboardField,
      getRelatedDashboardByField:getRelatedDashboardByField,
      getFieldIn:getFieldIn,
      setFiltersFromFiedlAndValue:setFiltersFromFiedlAndValue,
      getPivotField:getPivotField
    };
  });

});
//        window.open("#/dashboard"+dashboard.current.solr.server+targetDashboard+"?server="+encodeURIComponent(dashboard.current.solr.server),targetDashboard);
