define([
  'angular',
  'd3'
], function (angular,d3) {
  'use strict';

  var DEBUG = true; // DEBUG mode

  var module = angular.module('kibana.services');

  module.service('filterDialogSrv',function($q,dashboard, filterSrv,relatedDashboardSrv){

    var callback;
    var showRemoveCallback;
    var dialogMode;

    var hideDialogCallback;

    var hideDialog=function() {
      hideDialogCallback();
      console.log(d3.event);
    };

    var addMode=function(modePar){
      dialogMode=modePar;
    }

    var subscribeShow=function(fn){
        callback=fn;
    };

    var subscribeHide=function(fn){
        hideDialogCallback=fn;
    };

    var subscribeRemoveCallback=function(fn){
      showRemoveCallback=fn;
    };

    var build_search = function(field,value,mode) {
      DEBUG && console.log(d3.event);
      var active=true;
      if(mode==='either' && dialogMode=='orand'){
        active=false;
      }

      //---->
      //mode='either';

      if(value) {
        filterSrv.set({type:'terms',field:field,value:value,mandate:'must',active:active});
      } else {
        return;
      }
      if(mode!='either' || dialogMode!='orand'){
        dashboard.refresh();
      }
    };

    var hasFilter=function(type,field,value){
      var result=Object.keys(filterSrv.list).findIndex(function(d){
          return equals(filterSrv.list[d],{type:type,field:field,value:value});
        });
      if(result!==-1){
        return true;
      }else{
        return false;
      }
    };

    var showDialog=function(field,value,pageY,pageX) {
      if(hasFilter('terms',field,value)){
          callRemoveDialog(field,value,pageY,pageX);
        }else{
          callAddDialog(field,value,pageY,pageX);
      }
    };

    var callAddDialog=function(field,value,pageY,pageX){
      var resolve=function(mode){
        //if the directive resolve the promise passing an object type it means that a dashboard has beeen selected
        if(typeof mode=='object'){
          console.log("callAddDialog resolved with selection:"+mode.value);
          relatedDashboardSrv.goToDashboard(mode.value,field,value);
        }else{
          build_search(field,value,mode);
        }
      };

      var reject=function(){

      };
      if(!pageY){
        pageY=d3.event.pageY;
        pageX=d3.event.pageX;
      }
      //here the function call the related dashboard services to get the dashboard regarding the field and value selected
      callback(pageY+"px",pageX+10+"px",dialogMode,relatedDashboardSrv.getRelatedDashboardByField(field,value))
        .then(resolve,reject);
    };

    var callRemoveDialog=function(field,value,pageY,pageX){

      var resolve=function(){
          removeFilterByFieldAndValue(field,value);
          dashboard.refresh();
      };

      var reject=function(){

      };
      if(!pageY){
        pageY=d3.event.pageY;
        pageX=d3.event.pageX;
      }
      showRemoveCallback(pageY+"px",pageX+10+"px")
        .then(resolve,reject);
    };

    var equals=function(filter1,filter2){
      switch (filter1.type) {
        case 'terms':
          /*return (filter1.field===filter2.field) && (decodeURIComponent(filter1.value)===decodeURIComponent(filter2.value));*/
          return (decodeURIComponent(filter1.value)===decodeURIComponent(filter2.value));
        default:
          return false;

      }
    };

    var removeFilterByFieldAndValue=function(field,value){
      Object.keys(filterSrv.list).filter(function(d){
          return equals(filterSrv.list[d],{type:'terms',field:field,value:value});
        }).forEach(function(d){
          filterSrv.remove(filterSrv.list[d].id);
        });
    };

    var showDialog2=function(){
      var pageY=d3.event.pageY;
      var pageX=d3.event.pageX;
      callback(pageY+"px",pageX+10+"px","send");
    };

    return {
      subscribeShow:subscribeShow,
      subscribeHide:subscribeHide,
      subscribeRemoveCallback:subscribeRemoveCallback,
      showDialog:showDialog,
      showDialog2:showDialog2,
      hideDialog:hideDialog,
      addMode:addMode,
      removeFilterByFieldAndValue:removeFilterByFieldAndValue
    };
  });

});
