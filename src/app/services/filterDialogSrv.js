define([
  'angular',
  'd3'
], function (angular,d3) {
  'use strict';

  var DEBUG = true; // DEBUG mode

  var module = angular.module('kibana.services');

  module.service('filterDialogSrv',function($q,dashboard, filterSrv){

    var callback;

    var hideDialogCallback;

    var hideDialog=function() {
      hideDialogCallback();
      console.log(d3.event);
    };

    var subscribeShow=function(fn){
        callback=fn;
    };

    var subscribeHide=function(fn){
        hideDialogCallback=fn;
    };

    var build_search = function(field,value,mode) {
      DEBUG && console.log(d3.event);
      if(value) {
        filterSrv.set({type:'terms',field:field,value:value,mandate:mode});
      } else {
        return;
      }
      dashboard.refresh();
    };

    var showDialog=function(field,value,pageY,pageX) {
      var resolve=function(mode){
        build_search(field,value,mode);
      };

      var reject=function(){

      };
      if(!pageY){
        pageY=d3.event.pageY;
        pageX=d3.event.pageX;
      }
      callback(pageY+"px",pageX+"px")
        .then(resolve,reject);
    };

    return {
      subscribeShow:subscribeShow,
      subscribeHide:subscribeHide,
      showDialog:showDialog,
      hideDialog:hideDialog
    };
  });

});
