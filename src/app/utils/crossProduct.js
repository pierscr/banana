define('crossProduct',[],function () {
  'use strict';
    return function(){

          return {
            build:build,
            setDebug:setDebug,
            setLists:setLists,
            addFieldFn:addFieldFn,
            checkUniqueFn:checkUniqueFn,
            createFn:createFn,
            filterFn:filterFn,
            addFn:addFn,
            _addToResult:_addToResult,
            _log:_log
          };

          function setDebug(val){
            this.debug=val;
            return this;
          }

          function setLists(listA,listB){
            this.listA=listA;
            this.listB=listB;
            this.debug && this._log()
            return this;
          };

          function checkUniqueFn(fn){
            if(fn !=undefined){
              this.checkUnique=fn;
            }
            return this;
          };

          function addFn(fn){
            if(fn !=undefined){
              this.add=fn;
            }
            return this;
          };


          function addFieldFn(fn){
            if(fn !=undefined){
              this.addField=fn;
            }else{
              var self=this;
              this.result.map(function(curr){
                return self.addField(curr);
              });
              this.debug && this._log("addFieldFn")
            }
            return this;
          };

          function filterFn(fn){
            if(fn !=undefined){
              this.filter=fn;
            }else{
              this.result=this.result.filter(this.filter);
              this.debug && this._log("filterFn")
            }
            return this;
          };

          function _crossProduct(ListA,ListB){
            this.result=[].concat(...this.listA.map(d => this.listB.map(e => [].concat(d, e))));
            this.debug && this._log("_crossProduct")
            return this;
          }

          function createFn(fn){
            if(fn !=undefined){
              this.create=fn;
            }else{
              var self=this;
              this.result=this.result.map(function(curr){
                return self.create(curr);
              });
              this.debug && this._log("createFn")
            }
            return this;
          }

          function _addToResult(){
            var self=this;
            this.result=this.result.reduce(function(acc,curr){
              var mainValue=self.checkUnique(curr);
              mainValue?acc.push(self.add(curr,mainValue)):acc.push(curr);
              return acc;
            },[]);
            this.debug && this._log("_addToResult");
            return this.result;
          }

          function _log(arg){
            arg && console.log(arg);
            console.log(this.result);
            return this;
          }

          function build(){
            return _crossProduct.apply(this)
              .createFn()
              .addFieldFn()
              .filterFn()
              ._addToResult();
          }

        }
      });
