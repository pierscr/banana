'use strict'

define(['crossProduct'],function(crossProduct){

  var listA={ "buckets": [
    {
        "val": "Economic",
        "count": 1,
        "pr": 0.8999999761581421
    },
    {
        "val": "Environmental risks",
        "count": 1,
        "pr": 0.699999988079071
    },
    {
        "val": "Technological risks",
        "count": 1,
        "pr": 0.5
    }
  ]}

var listB = {"buckets": [
    {
        "val": "Stragetic",
        "count": 1,
        "pr": 0.8999999761581421
    },
    {
        "val": "Tactical",
        "count": 1,
        "pr": 0.699999988079071
    },
    {
        "val": "Gran stragetic",
        "count": 1,
        "pr": 0.5
    },
    {
        "val": "Operational",
        "count": 1,
        "pr": 0.30000001192092896
    }
  ]}

  describe('base',function(){

      it('init',function(){
        var testFn=function(){return "dumb"};
        crossProduct()
          .setLists(listA.buckets,listB.buckets)
          .addFieldFn(testFn)
          .createFn(testFn)
          .filterFn(testFn)
      });

      it('functionDefine',function(){
        var total=[
          {dim1:'Economic',dim2:'Operational',nuovo:'new field',score:100}
        ];

        var addFieldFn=function(obj){
          return obj.nuovo='new field';
        }

        var createFn=function(obj){
          return {dim1:obj[0].val,dim2:obj[1].val,score:obj[0].pr+obj[1].pr};
        }

        var filterFn=function(obj){
          return obj.score>1.5 ;
        }

        var checkUnique=function(obj){
          return total.find(function(curr){
            return curr.dim1===obj.dim1 &&
                  curr.dim2===obj.dim2
          })
        }

        var addFn=function(ob1,ob2){
          ob1.score=ob1.score+ob2.score;
          return ob1;
        }

        crossProduct()
          .setDebug(true)
          .setLists(listA.buckets,listB.buckets)
          .addFieldFn(addFieldFn)
          .createFn(createFn)
          .filterFn(filterFn)
          .checkUniqueFn(checkUnique)
          .addFn(addFn)
          .build()
      });

  })
})
