define('dataGraphMapping',[],function () {
  'use strict';
    return function(){
      var nodes=[];
      var linkName1="Cluster1";
      var linkName2="Cluster2";
      var links=[];
      var filteredNodes=[];
      var indexedLinks=[];
      var filter=[];

      function _removeNodesInLink(nodes,nodesToRemove){
        nodesToRemove
          .sort(function(a,b){return b-a;})
          .forEach(function(item){nodes.splice(item,1);});
      }

      function _clusterStringReplace(str){
        return str.replace(/,|\|/gi,"");
      }

      function _nodeLinkCompare(nodeValue,linkValue){
        return nodeValue && linkValue && _clusterStringReplace(nodeValue) === _clusterStringReplace(linkValue);
      }

      /* map the node index into the link node reference parameter - add the matching node to filteredNodes Array*/
      function _linkNodeMap(link,clusterName,destinationParam,node,flag,filteredNodes,mapFunction){
        var value=Array.isArray(link[clusterName])?link[clusterName][0]:link[clusterName];
        if(!flag  && _nodeLinkCompare(node.value,value)){
          flag=true;
          mapFunction(filteredNodes,link,destinationParam,node);
          return true;
        }
        return flag;
      }

      function _pushFilteredNode(filteredNodes,link,destinationParam,node){
        node.name=node.value;
        filteredNodes.push(node);
        link[destinationParam]=filteredNodes.length-1;
      }

      function _getIndexFilteredNode(i,link,destinationParam){
        link[destinationParam]=i;
      }

      function _linkIndexer(link,nodes,filteredNodes,linkName1,linkName2){
        var found1=false;
        var found2=false;
        var nodeToRemove=[];
        if(Array.isArray(link[linkName1]) && link[linkName1][0] && link[linkName2][0] && link[linkName1][0]===link[linkName2][0])
            return;
        if(!Array.isArray(link[linkName1]) && link[linkName1] && link[linkName2] && link[linkName1]===link[linkName2])
            return;
        for(var i=0; i<filteredNodes.length; i++){
          found1=_linkNodeMap(link,linkName1,'source',filteredNodes[i],found1,i,_getIndexFilteredNode);
          found2=_linkNodeMap(link,linkName2,'target',filteredNodes[i],found2,i,_getIndexFilteredNode);
          if(found1 && found2){break;}
        }
        if(!(found1 && found2)){
          for(var k=0; k<nodes.length; k++){
            if(!found1){
              found1=_linkNodeMap(link,linkName1,'source',nodes[k],found1,filteredNodes,_pushFilteredNode);
              found1 && nodeToRemove.push(k);
            }
            if(!found2){
              found2=_linkNodeMap(link,linkName2,'target',nodes[k],found2,filteredNodes,_pushFilteredNode);
              found2 && nodeToRemove.push(k);
            }
            if(found1 && found2) {break;}
          }
          _removeNodesInLink(nodes,nodeToRemove);
        }
        return found1 && found2;
      }

      function _isFilterInCluster(filter,cluster1,cluster2){
        return (_nodeLinkCompare(cluster1,filter) || _nodeLinkCompare(cluster2,filter));
      }

      var build=function(){
        /*if the node is just one there isn't link to calculate*/
        if(nodes.length===1){
          filteredNodes=nodes;
          return;
        }
        /*using 'for' because of performance*/
        for(var i=0; i<links.length; i++){
          if(links[i].source !== undefined && links[i].target !== undefined){
            continue;
          }
          filter.length=0;
          if(filter.length!==0){
            for(var k=0 ; k<filter.length; k++){
              var valueLink1=Array.isArray(links[i][linkName1])?links[i][linkName1][0]:links[i][linkName1];
              var valueLink2=Array.isArray(links[i][linkName2])?links[i][linkName2][0]:links[i][linkName2];
              if(_isFilterInCluster(filter[k],valueLink1,valueLink2)){
                _linkIndexer(links[i],nodes,filteredNodes,linkName1,linkName2) &&  indexedLinks.push(links[i]);
                break;
              }
            }
          }else{
              _linkIndexer(links[i],nodes,filteredNodes,linkName1,linkName2) &&  indexedLinks.push(links[i]);
              //filteredNodes=filteredNodes.concat(nodes);
          }
        }
        if(filter.length===0){
          filteredNodes=filteredNodes.concat(nodes);
        }
        return this;
      };

      var nodesFn=function(nodesArg){
        if(nodesArg){
          nodes=nodesArg;
          return this;
        }else{
          return nodes;
        }
      };

      var linkName1Fn=function(linkNameArg){
        if(linkNameArg){
          linkName1=linkNameArg;
          return this;
        }else{
          return linkName1;
        }
      };

      var linkName2Fn=function(linkNameArg){
        if(linkNameArg){
          linkName2=linkNameArg;
          return this;
        }else{
          return linkName2;
        }
      };

      var linksFn=function(linksArg){
        if(linksArg){
          links=linksArg;
          return this;
        }else{
          return links;
        }
      };

      var filterFn=function(filterArg){
        if(filterArg){
          filter.push(filterArg);
          return this;
        }else{
          return filter;
        }
      };

      function indexedLinksFn(){
        return indexedLinks;
      }

      function filteredNodesFn(){
        return filteredNodes;
      }

      return {
          nodes:nodesFn,
          links:linksFn,
          filter:filterFn,
          build:build,
          filteredNodes:filteredNodesFn,
          indexedLinks:indexedLinksFn,
          linkName1:linkName1Fn,
          linkName2:linkName2Fn,
          _removeNodesInLink:_removeNodesInLink,
          _linkNodeMap:_linkNodeMap,
          _linkIndexer:_linkIndexer,
          _pushFilteredNode:_pushFilteredNode,
          _getIndexFilteredNode:_getIndexFilteredNode,
          _nodeLinkCompare:_nodeLinkCompare,
          _isFilterInCluster:_isFilterInCluster
      };
    };
});
