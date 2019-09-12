define('pivotToLabel',[],function(){
  'use strict';

  var elemLimit=10;
  function createNode(data){
    var elem="<span>"+data.value+" ("+ data.count+") </span>";
    if(data.pivot){
      elem="<div><strong>"+data.field+":</strong>"+elem;
    }
    return elem + extract(data);
  }

  function extract(pivotData){
    if(pivotData.pivot){
      return "<div><strong>"+pivotData.pivot[0].field+":</strong> "+pivotData.pivot.slice(0,elemLimit).map(createNode).reduce(
        function(tot,item){
          return tot+item;
        })+"</div>";
    }else{
      return "";
    }
  }

  return function(pivotedData){
    return extract(pivotedData);
  };
});
