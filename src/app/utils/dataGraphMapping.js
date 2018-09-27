define('dataGraphMapping',[],function () {
  'use strict';
    return function(){
      var nodes=[];
      var links=[];
      var filteredNodes=[];
      var indexedLinks=[];
      var filter;

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

      /* map the filteredNodes index into the link node reference parameter - add the matching node to filteredNodes Array*/
      function _linkNodeMap(link,clusterName,destinationParam,node,flag,filteredNodes,mapFunction){
        if(!flag  && _nodeLinkCompare(node.value,link[clusterName][0])){
          flag=true;
          mapFunction(filteredNodes,link,destinationParam,node);
          return true;
        }
        return false;
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
        for(var i=0; i<filteredNodes.length; i++){
          found1=_linkNodeMap(link,'Cluster1','source',filteredNodes[i],found1,i,_getIndexFilteredNode);
          found2=_linkNodeMap(link,'Cluster2','target',filteredNodes[i],found2,i,_getIndexFilteredNode);
          if(found1 && found2){break;}
        }
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

      function _isFilterInCluster(filter,cluster1,cluster2){
        return (_nodeLinkCompare(cluster1,filter) || _nodeLinkCompare(cluster2,filter));
      }

      function build(){
        /*use of 'for' because of performance*/
        for(var i=0; i<links.length; i++){
          if(!filter || _isFilterInCluster(filter,links[i].Cluster1[0],links[i].Cluster2[0])){
            _linkIndexer(links[i],nodes,filteredNodes);
            indexedLinks.push(links[i]);
          }
        }
        return this;
      }

      function nodesFn(nodesArg){
        if(nodesArg){
          nodes=nodesArg;
          return this;
        }else{
          return nodes;
        }
      }

      function linksFn(linksArg){
        if(linksArg){
          links=linksArg;
          return this;
        }else{
          return links;
        }
      }

      function filterFn(filterArg){
        if(filterArg){
          filter=filterArg;
          return this;
        }else{
          return filter;
        }
      }

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
