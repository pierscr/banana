define(['angular'],function(angular){
    'use strict';
    console.log("file filterDialog loaded");

    var module = angular.module('kibana.directives');

    module.directive('filterDialog', function(filterDialogSrv,$q,filterSrv,dashboard) {
      console.log("directive filterDialog loaded");
      return {
          restrict: 'E',
          templateUrl:'app/html/filterDialog.html',
          controller:function($scope){
            $scope.dialog='';
            $scope.style={position:"absolute",top:"100px",left:"50px"};
            $scope.prova='vuoto';
            $scope.selections=[];
            var showAddDeferred;
            var showRemoveDeferred;
            var initAddPromise=function(){
              showAddDeferred=$q.defer();
              filterDialogSrv.subscribeShow(showAddDialog);
            };

            var initRemovePromise=function(){
              showRemoveDeferred=$q.defer();
              filterDialogSrv.subscribeRemoveCallback(showRemoveDialog);
            };

            var showAddDialog=function(posy,posx,mode,selectionsFn,values){
              $scope.selections=[];
              if(mode!==undefined){
                $scope.dialog=mode;
              }else{
                $scope.dialog='orand';
              }
              selectionsFn($scope.selections);

              $scope.style.top=posy;
              $scope.style.left=posx;
              $scope.showCompare= filterSrv.idsByMandate('either').length>0?true:false;
              $scope.$apply();
              return showAddDeferred.promise;
            };

            var showRemoveDialog=function(posy,posx,selectionsFn){
              $scope.selections=[];
              selectionsFn($scope.selections);
              $scope.dialog='remove';
              $scope.style.top=posy;
              $scope.style.left=posx;
              $scope.$apply();
              return showRemoveDeferred.promise;
            };

            $scope.removeFilterSelection=function(selection){
              if(selection!==undefined){
                console.log("ah ca ti ncucciavu:"+selection);
                selection.callback()
                showRemoveDeferred.resolve({mode:'selection',value:selection.value});
              }else{
                showRemoveDeferred.resolve();
              }
              $scope.close();
              initRemovePromise();
            };

            // var hideCallback=function(){
            //   $scope.dialog=false;
            //   $scope.$apply();
            // };

            $scope.close=function(){
              $scope.dialog=false;
            };

            $scope.andSelection=function(selection){
              if(selection!==undefined){
                if(selection.callback!=undefined){
                  selection.callback();
                  showAddDeferred.resolve({mode:'selection',value:selection.value});
                }else{
                  showAddDeferred.resolve();
                }
              }else{
                showAddDeferred.resolve();
              }

              $scope.close();
              initAddPromise();
            };

            $scope.orSelection=function(){
              showAddDeferred.resolve('either');
              $scope.close();
              initAddPromise();
            };

            $scope.abort=function(){
              $scope.close();
              initAddPromise();
            };


            $scope.applyCompare=function(){
              filterSrv.applyCompare();
              $scope.close();
              dashboard.refresh();
            };

            initAddPromise();
            initRemovePromise();

          }
        };
    });
});
