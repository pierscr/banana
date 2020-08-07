define('grid',['dataGraphMapping','d3'],function(dataGraphMapping,d3){
  'use strict';
    return function(nodeList,addedLinks){


      nodeList = typeof nodeList === 'undefined' ? new Array: nodeList;
      addedLinks=  typeof addedLinks === 'undefined' ? new Array: addedLinks;
      var linkList = [];
      var dataProcessor;
      var rowFieldName;
      var colFieldName;
      var sizeParameter;
      var nodeListResult=[];
      var step=-1;
      var columnTitles=[];
      var titleHeigth=0;
      var rowsNumberPar;
      var link1FieldName="Cluster1";
      var link2FieldName="Cluster2";

      var _nodeIndexing=function(nodeList){

        var nodeListIndex=0;
        var indexedNode=[];

        function _addNode(node){
          node.id=nodeListIndex;
          nodeListIndex++;
          return node;
        }

        function addNodes(newNodes){
          indexedNode=indexedNode.concat(newNodes.map(_addNode));
          return this;
        }

        function getNodes(){
          return indexedNode;
        }

        addNodes(nodeList);

        return {
          addNodes:addNodes,
          getNodes:getNodes
        };
      };

      var rowField=function(fieldName){
        rowFieldName=fieldName;
        return this;
      };

      var link1Field=function(fieldName){
        link1FieldName=fieldName;
        return this;
      };

      var link2Field=function(fieldName){
        link2FieldName=fieldName;
        return this;
      };

      var rowsNumber=function(_rowsNumberPar){
        if(!_rowsNumberPar){return rowsNumberPar;}
        rowsNumberPar=_rowsNumberPar;
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
        if(arguments.length){return nodeListResult[arg];}
        return nodeListResult;
      };

      var links=function(arg){
        if(arguments.length){return linkList[arg];}
        return linkList;
      };

      var setDataProcessor=function(_dataProcessor){
        dataProcessor=_dataProcessor;
        return this;
      };

      var addNode=function(nodeListPar){
        if(!nodeListPar.length){
          return this;
        }

        nodeList=nodeList
        .filter(function(item){
            return item.step<nodeListPar[0].step;
        })
        .concat(nodeListPar);
        return this;
      };

      var addLink=function(linkListPar){
        addedLinks=linkListPar;
        return this;
      };

      var stepFn=function(stepPar){
        step=stepPar;
        return this;
      }

      var reset=function(){
        linkList = [];
        nodeListResult=[];
        nodeList = [];
        addedLinks = [];
      }


      var addTitleList=function(columnTitlesPar){
        columnTitles=columnTitlesPar;
      }

      var addTitleHeight=function(titleHeigthPar){
        titleHeigth=titleHeigthPar;
        return this;
      }

      var getTitleList=function(){
          return columnTitles;
      }

      return {
        nodes:nodes,
        links:links,
        rowField:rowField,
        colField:colField,
        size:size,
        link1Field:link1Field,
        link2Field:link2Field,
        setDataProcessor:setDataProcessor,
        plainDataProcessor:_plainDataProcessor,
        build:build,
        addNode:addNode,
        addLink:addLink,
        _nodeIndexing:_nodeIndexing,
        stepFn:stepFn,
        reset:reset,
        addTitleList:addTitleList,
        getTitleList:getTitleList,
        addTitleHeight:addTitleHeight,
        rowsNumber:rowsNumber
      };



      //rifattorizzare questo modulo esteranamente
      function _plainDataProcessor(){



        var getYDomain=function(nodeList){
          var maxLength=0;
          if(rowsNumberPar){
            maxLength=rowsNumberPar;
          }else{
            maxLength=nodeList.reduce(function(domain,d){
              return Math.max(domain,d.values.length);
            },0);
          }
          return  Array.from(new Array(maxLength).keys());
        };

        var getXDomain=function(){
          var domainSet=nodeList.reduce(function(domain,d){
            return domain.add(d[colFieldName]);
          },new Set());
          return Array.from(domainSet);
        };

        var setXDomainFn=function(xDomainFn){
            getXDomain=xDomainFn;
            return this;
        };


        var iterate=function(nodeList,rowField,colFieldName,callback){

          var nestedData=d3.nest()
          .key(function(d){return d[colFieldName];})
          .entries(nodeList);

          var xScale=d3.scale.ordinal()
          .domain(dataProcessor.getXDomain(nodeList,colFieldName))
          .rangePoints([0,sizeParameter[1]],0.5);


          var yScale=d3.scale.ordinal()
          .domain(dataProcessor.getYDomain(nestedData,rowFieldName))
          .rangePoints([titleHeigth,sizeParameter[0]-titleHeigth],0.5);


          nestedData.forEach(function(colArray, colIndex){

            colArray.values.forEach(function(obj,rowIndex){
              function yearCompare(yearRange){
                //console.log(yearRange)
                return yearRange===obj[colFieldName];
              };
              obj.x=xScale(obj[colFieldName]);
              obj.y=yScale(rowIndex);
              obj.row=rowIndex;
              obj.col=dataProcessor.getXDomain().findIndex(yearCompare);
              callback(obj);
            });
          });
        };

        return {
          getYDomain:getYDomain,
          getXDomain:getXDomain,
          setXDomainFn:setXDomainFn,
          iterate:iterate
        };

      }

     //  function _bindNodesLinks(){
     //
     //    if(addedLinks.length>0){
     //
     //        var nodeTemp=nodeList.slice();
     //        //console.log(nodeTemp);
     //        var initModule=dataGraphMapping();
     //            initModule
     //               .nodes(nodeTemp)
     //               .links(addedLinks)
     //               .build();
     //
     //      //console.log(addedLinks)
     //       addedLinks=initModule.links();
     //     }
     // };


     function buildTitle(titlesList){
       if(titleHeigth>0){
         var titleScale=d3.scale.ordinal()
         .domain(dataProcessor.getXDomain(nodeList,colFieldName))
         .rangePoints([0,sizeParameter[1]],0.5);

         columnTitles=dataProcessor.getXDomain(nodeList,colFieldName)
           .map(function(item){
             var obj={x:(titleScale(item)-10),y:12,title:item};
             return obj;
         });
       }
     };


      function build(){
        nodeListResult=[];

          var isStep=function(obj,step){
            //return step>0?obj.col===step:true;
            return obj.col===step;
          };

          var _linkMap=function(obj,links,step){
            return links.map(function(link){
                var link1=Array.isArray(link[link1FieldName])?link[link1FieldName][0]:link[link1FieldName];
                var link2=Array.isArray(link[link2FieldName])?link[link2FieldName][0]:link[link2FieldName];
                if(link1===obj.value && isStep(obj,step)){
                  //console.log("step:"+step);
                  //console.log("cluster1---"+"x"+obj.x+" y:"+obj.y);
                  link.x1=obj.x;
                  link.y1=obj.y;
                  return link;
                }else if(link2===obj.value && isStep(obj,step+1)){
                  //console.log("step:"+step+1);
                  //console.log("cluster2--- x"+obj.x+" y:"+obj.y);
                  link.x2=obj.x;
                  link.y2=obj.y;
                  return link;
                }
            });
          };

          buildTitle(columnTitles);

         //this._bindNodesLinks();
         //console.log(addedLinks)
          dataProcessor.iterate(nodeList,rowField,colFieldName,function(obj){
              nodeListResult.push(obj);
              _linkMap(obj,addedLinks,step);
          });

          linkList=linkList
          .filter(function(item){
            if(addedLinks[0]==undefined)return true;
            return item.step<addedLinks[0].step;
          })
          .concat(addedLinks.filter(function(link){
            // console.log("--- link ---")
            // console.log(link);
            // if(link!=undefined){
            //   //console.log(link)
            // }
            return link!=undefined && link.x1!=undefined && link.x2!=undefined && link.y1!=undefined && link.y2!=undefined
          }));
          step=-1;

          // console.log("--- linklist ---")
          // console.log(linkList)

      }


    };
});
