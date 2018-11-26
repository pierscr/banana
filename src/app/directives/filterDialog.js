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

            var showAddDialog=function(posy,posx,mode){
              if(mode!==undefined){
                $scope.dialog=mode;
              }else{
                $scope.dialog='add';
              }
              $scope.style.top=posy;
              $scope.style.left=posx;
              $scope.showCompare= filterSrv.idsByMandate('either').length>0?true:false;
              $scope.$apply();
              return showAddDeferred.promise;
            };

            var showRemoveDialog=function(posy,posx){
              $scope.dialog='remove';
              $scope.style.top=posy;
              $scope.style.left=posx;
              $scope.$apply();
              return showRemoveDeferred.promise;
            };

            $scope.removeFilterSelection=function(){
              showRemoveDeferred.resolve();
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



            $scope.andSelection=function(){
              showAddDeferred.resolve('must');
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
