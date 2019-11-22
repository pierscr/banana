define('dataGraphMapping',[],function () {
  'use strict';
    return function(){
      var nodes=[];
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
        if(!flag  && _nodeLinkCompare(node.value,link[clusterName][0])){
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

      function _linkIndexer(link,nodes,filteredNodes){
        var found1=false;
        var found2=false;
        var nodeToRemove=[];
        if(link.Cluster1 && link.Cluster1[0] && link.Cluster2 && link.Cluster2[0] && link.Cluster1[0]===link.Cluster2[0])
            return;        
        for(var i=0; i<filteredNodes.length; i++){
          found1=_linkNodeMap(link,'Cluster1','source',filteredNodes[i],found1,i,_getIndexFilteredNode);
          found2=_linkNodeMap(link,'Cluster2','target',filteredNodes[i],found2,i,_getIndexFilteredNode);
          if(found1 && found2){break;}
        }
        if(!(found1 && found2)){
          for(var k=0; k<nodes.length; k++){
            if(!found1){
              found1=_linkNodeMap(link,'Cluster1','source',nodes[k],found1,filteredNodes,_pushFilteredNode);
              found1 && nodeToRemove.push(k);
            }
            if(!found2){
              found2=_linkNodeMap(link,'Cluster2','target',nodes[k],found2,filteredNodes,_pushFilteredNode);
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
              if(_isFilterInCluster(filter[k],links[i].Cluster1[0],links[i].Cluster2[0])){
                _linkIndexer(links[i],nodes,filteredNodes) &&  indexedLinks.push(links[i]);
                break;
              }
            }
          }else{
              _linkIndexer(links[i],nodes,filteredNodes) &&  indexedLinks.push(links[i]);
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
