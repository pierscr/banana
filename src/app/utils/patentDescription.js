define('patentDescription',[],function(){
  var labelLimit=10;

  var setLabelLimit=function(limit){
    labelLimit=limit;
  }


  function queryBuild(text){
    function q(tot,item){
      return tot+" "+item.toUpperCase().replace(/_/g,"/")
    };

    return "&q=*:*&wt=json&fq=id:("+text.reduce(q,"")+")&sort=id asc";
  }



  function getDescription(data,$scope,dashboard){
    data.desc="test";
    $scope.sjs.client.server(dashboard.current.solr.server + $scope.panel.patentDescriptionCollection);
    var request = $scope.sjs.Request();
    var callbackFn;
    function thenRun(callaback){
      callbackFn=callaback;
    };
    if($scope.panel.patent){
      $scope.sjs.Request()
          .setQuery(queryBuild(data))
          .doSearch()
          .then(
            function(results){
              var desc=results.response.docs.reduce(function(tot,item){
                return tot.concat("<div><strong>"+item.id+"</strong><span> "+item.title+"</span></div></br>");
              },"");
              callbackFn(desc);
            });
          }
    return {
      thenRun:thenRun
    };
  }

  var createDataLabel=function(label){
    var t=label.name || label.value;
    t=t.split('/').pop()
    var dataArray=t.split(",");
    if(dataArray.length>labelLimit){
      dataArray=dataArray.slice(0,labelLimit);
      dataArray.push("...");
    }
    var dataLabelArray=[];

    dataArray.reduce(function(tot,elem){
      var currFirstLevel=elem.slice(0,4)
      var index=tot.findIndex(function(curr){return curr.firstLevel==currFirstLevel})
      if(index!=-1){
        tot[index].secondLevel.push(elem);
      }else{
        tot.push({firstLevel:currFirstLevel,secondLevel:[currFirstLevel,elem.slice(0,3),elem]});
      }
      return tot;
    },dataLabelArray);

    return dataLabelArray;
  }

  return {
    getDescription:getDescription,
    createDataLabel:createDataLabel,
    setLabelLimit:setLabelLimit
  }
});
