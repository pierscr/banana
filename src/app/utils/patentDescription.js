define('patentDescription',[],function(){
  var labelLimit=10;
  var labelTextLength;
  var patentCodeField;

  var setLabelLimit=function(limit){
    labelLimit=limit;
  }


  var setLabelTextLength=function(labelTextLengthPar){
    labelTextLength=labelTextLengthPar;
  }
  var setPatentCodeField=function(patentCodeFieldPar){
    patentCodeField=patentCodeFieldPar;
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
          .setQuery(queryBuild(data.map(x => x.replace(/ /g,''))))
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

  var getDataArrayFacet=function(label){
    if(label.field == patentCodeField){
      return [label.value];
    }else if(label.pivot){
      return label.pivot.reduce(function(tot,cur){
        return tot.concat(getDataArrayFacet(cur));
      },Array())
    }else{
      return [];
    }
  }

  var createDataLabel=function(label){
    // var t=label.name || label.value;
    // t=t.split('/').pop()
    // var dataArray=t.split(",");
    // if(dataArray.length>labelLimit){
    //   dataArray=dataArray.slice(0,labelLimit);
    //   dataArray.push("...");
    // }
    var dataLabelArray=[];

    //--->
    var dataArray = getDataArrayFacet(label).slice(0,100);

    //-->

    dataArray.reduce(function(tot,elem){
      var currFirstLevel=elem.slice(0,4)
      var index=tot.findIndex(function(curr){return curr.firstLevel==currFirstLevel})
      if(index!=-1){
        var twolevelcode=elem.split("/");
        if(twolevelcode.length>1 && tot[index].secondLevel.indexOf(twolevelcode[0])===-1){
          tot[index].secondLevel.push(twolevelcode[0]);
        }
        tot[index].secondLevel.push(elem);
      }else{
        var obj=[];
        obj.push(currFirstLevel);
        obj.push(elem.slice(0,3));
        var twolevelcode=elem.split("/");
        if(twolevelcode.length>1){
          obj.push(twolevelcode[0]);
        }
        obj.push(elem);
        tot.push({firstLevel:currFirstLevel,secondLevel:obj});
      }
      return tot;
    },dataLabelArray);

    return dataLabelArray;
  }

  return {
    getDescription:getDescription,
    createDataLabel:createDataLabel,
    setLabelLimit:setLabelLimit,
    setLabelTextLength:setLabelTextLength,
    setPatentCodeField:setPatentCodeField
  }
});
