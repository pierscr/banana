define('grid',['dataGraphMapping','d3'],function(dataGraphMapping,d3){
  'use strict';
    return function(data,linkList){

      var dataProcessor;
      var rowFieldName;
      var colFieldName;
      var sizeParameter;
      var nodeList=[];

      var rowField=function(fieldName){
        rowFieldName=fieldName;
        return this;
      };

      var colField=function(fieldName){
        colFieldName=fieldName;
        return this;
      };

      var size=function(_size){
        if(!_size){return sizeParameter;}
        sizeParameter=_size;
        return this;
      };

      var nodes=function(arg){
        if(arguments.length){return nodeList[arg];}
        return nodeList;
      };

      var links=function(arg){
        if(arguments.length){return linkList[arg];}
        return linkList;
      };

      var setDataProcessor=function(_dataProcessor){
        dataProcessor=_dataProcessor;
        return this;
      };

      return {
        nodes:nodes,
        links:links,
        rowField:rowField,
        colField:colField,
        size:size,
        setDataProcessor:setDataProcessor,
        plainDataProcessor:_plainDataProcessor,
        build:build
      };



      //rifattorizzare questo modulo esteranamente
      function _plainDataProcessor(){

        var getYDomain=function(data){
          var maxLength=data.reduce(function(domain,d){
            return Math.max(domain,d.values.length);
          },0);
          return  Array.from(new Array(maxLength).keys());
        };

        var getXDomain=function(data,field){
          var domainSet=data.reduce(function(domain,d){
            return domain.add(d[field]);
          },new Set());
          return Array.from(domainSet);
        };

        var iterate=function(data,rowField,colFieldName,callback){
          var nestedData=d3.nest()
          .key(function(d){return d[colFieldName];})
          .entries(data);

          var xScale=d3.scale.ordinal()
          .domain(dataProcessor().getXDomain(data,colFieldName))
          .rangePoints([0,sizeParameter[1]],0.5);


          var yScale=d3.scale.ordinal()
          .domain(dataProcessor().getYDomain(nestedData,rowFieldName))
          .rangePoints([0,sizeParameter[0]],0.5);


          nestedData.forEach(function(colArray, colIndex){

            colArray.values.forEach(function(obj,rowIndex){
              obj.x=xScale(obj[colFieldName]);
              obj.y=yScale(rowIndex);
              obj.row=rowIndex;
              obj.col=colIndex;
              callback(obj);
            });
          });
        };

        return {
          getYDomain:getYDomain,
          getXDomain:getXDomain,
          iterate:iterate
        };

      }



      function build(){

          var _linkMap=function(obj,links){
            return links.map(function(link){
              if(link.source===obj.id){
                link.x1=obj.x;
                link.y1=obj.y;
                return link;
              }else if(link.target===obj.id){
                link.x2=obj.x;
                link.y2=obj.y;
                return link;
              }
            });
          };

          dataProcessor().iterate(data,rowField,colFieldName,function(obj){
              nodeList.push(obj);
              links=_linkMap(obj,linkList);
          });

      }


    };
});
