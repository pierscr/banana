define([
  'angular',
  'd3',
  'underscore',
  'jquery'
], function (angular,d3,_,$) {
  'use strict';

  var DEBUG = true; // DEBUG mode

  var module = angular.module('kibana.services');

  module.service('relatedDashboardSrv',function($q,dashboard, filterSrv,querySrv,solrSrv,filterDialogSrv){

    var callback;
    var changeMode="this_tab";//"new_tab"
    var navigationMode="incremental";//static
    var navStacks=[];

    filterDialogSrv.subscribeDialogList(function(field,value,selections){

        getRelatedDashboardByField(field,value)
        .forEach(function(elem){
            var badge='';
            var labelObject={
                  value:elem,
                  badge:"",
                  callback:function(){
                      goToDashboard(elem,field,value);
                    }
                  }
            getNumberOfResult(elem,field,value).then(function(result){
              labelObject.badge=result;
            })
            selections.push(labelObject)
          })
    });

    var goToDashboard=function(targetDashboardLabel,field,value){
        console.log("go to this target dashboad: "+targetDashboardLabel );
        // set current
        addDashboardToNavStack(targetDashboardLabel,value);
        // reset
        querySrv.init();
        filterSrv.init();
        filterSrv.removeAll(true);
        var targetDashboardId=getRelatedDashboardId(targetDashboardLabel)
        setFiltersFromFiedlAndValue(targetDashboardId,field,value);
        //  TODO ADD breadcrumb and davigation stack of current dashboard
        goToDashboardGeneral(targetDashboardId);
    }

    var goToDashboardGeneral=function(targetDashboardId){
      switch (changeMode) {
        case "new_tab":
          goToDashboardNewTab(targetDashboardId);
          break;
        default:
          goToDashboardCurrentTab(targetDashboardId);
      }
    }


    var backToDashboard=function(idx){
      if(idx !==0 && idx>=navStacks.length){
        return;
      }
      if(navigationMode=='incremental'){
        var targetDashboard=navStacks[idx].dashboard;
        //querySrv.init(navStacks[idx].query.list,navStacks[idx].query.ids);
        filterSrv.init(navStacks[idx].filters.list,navStacks[idx].filters.ids);
        removeDashboardFromNavStack(idx+1);
        goToDashboardGeneral(targetDashboard);
      }else{
        //TODO in case we have fixed breadcrumbs
      }
    }

    var goToDashboardNewTab=function(targetDashboard){
      console.log("go to new dashboard new tab");
    }

    var goToDashboardCurrentTab=function(targetDashboardId){
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

    var getRelatedDashboardLabelById=function(dashboardId){
      if(dashboardId==undefined){
        throw new Error('dashboard label of ad undefined dashboadid cannot be found');
      }
      var elem=dashboard.current.related_dashboard
        .find(function(elem){
          return elem.dashboard==dashboardId;
        });
      if(elem!=undefined){
        return elem.label;
      }else{
          throw new Error('dashboard with '+dashboardId+' id cannot be found');
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

    var getRelatedDashboardCountField=function(targetDashboardId){
      var elem=dashboard.current.related_dashboard
        .find(function(elem){
          return elem.dashboard==targetDashboardId;
        });
      if(elem!=undefined){
        return elem.countfield;
      }
    }

    var getRelatedDashboardFieldLabel=function(targetDashboardLabel){
      var elem=dashboard.current.related_dashboard
        .find(function(elem){
          return elem.label==targetDashboardLabel;
        });
      if(elem!=undefined && elem.fieldlabel!=undefined ){
        return elem.fieldlabel;
      }else{
          return "";
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
        solrSrv.getFacet(getFieldIn(targetDashboardId),100,"&"+filterSrv.getSolrFq(),function(fields){
          filterSrv.removeAll(true);
          if(fields[getFieldIn(targetDashboardId)].length==0){
            filterSrv.set({type:'terms',field:getRelatedDashboardField(targetDashboardId,field),"no-match":elem,mandate:'must'});
          }
          fields[getFieldIn(targetDashboardId)].forEach(function(elem,index){
            index % 2 !== 0 || filterSrv.set({type:'terms',field:getRelatedDashboardField(targetDashboardId,field),value:elem,mandate:'either'});
          });
        });
      }
    }

    var getNumberOfResult=function(targetDashboard,field,value){
      var deferred=$q.defer();
      var targetDashboardId=getRelatedDashboardId(targetDashboard);
      var filters=[];
      var pivotField=getPivotField(targetDashboardId)
      if(getFieldIn(targetDashboardId)==field){
        filters.push({type:'terms',field:getRelatedDashboardField(targetDashboardId,field),value:value,mandate:'must'});
        var countField=getRelatedDashboardCountField(targetDashboardId) || "id";
        solrSrv.count(countField,1000,filters,getCore(targetDashboardId),function(count){
          deferred.resolve(count);
        });
      }else if(pivotField!=undefined){
        filters.push({type:'terms',field:field,value:value,mandate:'must'});
        solrSrv.getFacet(getFieldIn(targetDashboardId),100,filterSrv.filtersQueryString(filters),function(fields){
          filters=[];
          if(fields[getFieldIn(targetDashboardId)].length==0){
            filters.push({type:'terms',field:getRelatedDashboardField(targetDashboardId,field),"no-match":elem,mandate:'must'});
          }
          fields[getFieldIn(targetDashboardId)].forEach(function(elem,index){
            index % 2 !== 0 || filters.push({type:'terms',field:getRelatedDashboardField(targetDashboardId,field),value:elem,mandate:'either'});
          });

          solrSrv.count(getFieldOut(targetDashboardId),1000,filters,getCore(targetDashboardId),function(count){
            deferred.resolve(count);
          });
        });
      }
      return deferred.promise;
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

    var getFieldOut=function(targetDashboardId){
      var elem=dashboard.current.related_dashboard
        .find(function(elem){
          return elem.dashboard==targetDashboardId;
        });
      if(elem!=undefined){
        return elem.fieldout;
      }
    }

    var addDashboardToNavStack=function(label,value){
      if(navigationMode=='incremental'){
        if(dashboard.breadcrumbs.length===0){
          dashboard.breadcrumbs.push({title:dashboard.current.title,param:"Home"});
        }
        var fieldlabel=getRelatedDashboardFieldLabel(label);
        dashboard.breadcrumbs.push({title:label,label:fieldlabel,param:value,});
        //var filters=_.clone(filterSrv.getFilters());
        var filters = $.extend(true, {}, filterSrv.getFilters());
        // filters.list=Array.from(filterSrv.getFilters().list);
        // filters.ids=Array.from(filterSrv.getFilters().ids);
        var query=$.extend(true, {}, querySrv.getQueries());
        //var query=_.clone(querySrv.getQueries());
        // query.list=Array.from(querySrv.getQueries().list);
        // query.ids=Array.from(querySrv.getQueries().ids);
        navStacks.push({
            dashboard:dashboard.current.title,
            filters:filters,
            query:query
          });
      }else{
        //TODO in case we have fixed breadcrumbs filter must be put in the right dashboard stack
      }

    }

    var removeDashboardFromNavStack=function(idx){
      if(idx==1){
        dashboard.breadcrumbs=[];
      }else{
        dashboard.breadcrumbs.splice(idx);
      }
      //navstack has no the current element therefore it is smaller than an element compared to breadcrumbs
      navStacks.splice(idx-1);
    }

    var removeBreadcrumbBadge=function(){
      var lastIndex=dashboard.breadcrumbs.length;
      if(lastIndex>0){
          dashboard.breadcrumbs[lastIndex-1].param="";
          dashboard.breadcrumbs[lastIndex-1].label="";
      }
    }

    var setDashboardIcon=function(panel,value){
      var check=function(value){
        var elem=dashboard.current.related_dashboard
          .find(function(elem){

            return (elem.fieldin && value) && (elem.fieldin.indexOf(value)!=-1 || (elem.pivotfield && elem.pivotfield.indexOf(value)!=-1))
          });
          if(elem!=undefined){
            panel.dashboardIcon=true;
            return true;
          }
          panel.dashboardIcon=false;
          return false;
      }
      if(Array.isArray(value)){
        value.find(function(elem){
          return check(elem);
        });
      }else{
        check(value);
      }

    }

    var checkDashboard=function(field){
      var elem=dashboard.current.related_dashboard
        .find(function(elem){
          return (elem.fieldin && field) && (elem.fieldin.indexOf(field)!=-1 || (elem.pivotfield && elem.pivotfield.indexOf(field)!=-1))
        });
        if(elem!=undefined){
          panel.dashboardIcon=true;
          return true;
        }
      return false
    }

    var getCore=function(dashboardId){
      return dashboard.dashboard_list_objects.find(function(elem){
        return elem.id==dashboardId;
      }).core_name;
    }

    filterSrv.addOnRemoveCallback(removeBreadcrumbBadge);

    return {
      goToDashboard:goToDashboard,
      backToDashboard:backToDashboard,
      getRelatedDashboardId:getRelatedDashboardId,
      getRelatedDashboardField:getRelatedDashboardField,
      getRelatedDashboardByField:getRelatedDashboardByField,
      getFieldIn:getFieldIn,
      setFiltersFromFiedlAndValue:setFiltersFromFiedlAndValue,
      getPivotField:getPivotField,
      removeBreadcrumbBadge:removeBreadcrumbBadge,
      setDashboardIcon:setDashboardIcon,
      checkDashboard:checkDashboard
    };
  });

});
//        window.open("#/dashboard"+dashboard.current.solr.server+targetDashboard+"?server="+encodeURIComponent(dashboard.current.solr.server),targetDashboard);
