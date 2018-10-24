define(['angular'],function(angular){
    'use strict';
    console.log("file filterDialog loaded");

    var module = angular.module('kibana.directives');

    module.directive('filterDialog', function(filterDialogSrv,$q) {
      console.log("directive filterDialog loaded");
      return {
          restrict: 'E',
          templateUrl:'app/html/filterDialog.html',
          controller:function($scope){
            $scope.dialog=false;
            $scope.style={position:"absolute",top:"100px",left:"50px"};
            $scope.prova='vuoto';
            var showDeferred;
            var initPromise=function(){
              showDeferred=$q.defer();
              filterDialogSrv.subscribeShow(showCallback);
            }

            var showCallback=function(posy,posx){
              $scope.dialog=true;
              $scope.style.top=posy;
              $scope.style.left=posx;
              $scope.$apply();
              return showDeferred.promise;
            };

            // var hideCallback=function(){
            //   $scope.dialog=false;
            //   $scope.$apply();
            // };

            $scope.close=function(){
              $scope.dialog=false;
            };



            $scope.andSelection=function(){
              showDeferred.resolve('must');
              $scope.close();
              initPromise();
            };

            $scope.orSelection=function(){
              showDeferred.resolve('either');
              $scope.close();
              initPromise();
            };

            $scope.abort=function(){
              $scope.close();
              initPromise();
            };

            initPromise();

          }
        };
    });
});
