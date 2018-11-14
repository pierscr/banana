'use strict';


define(['dataGraphMapping'],function(dataGraphMapping){
  describe('base',function(){
    var link;
    var nodes;

    function initData1(){
      link={Cluster1:['secondo'],Cluster2:['quinto']};
      nodes=new Array();
      nodes.push({field:"cluster_h",value:'primo',count:1});
      nodes.push({field:"cluster_h",value:'secondo',count:10});
      nodes.push({field:"cluster_h",value:'terzo',count:13});
      nodes.push({field:"cluster_h",value:'quarto',count:11});
      nodes.push({field:"cluster_h",value:'quinto',count:14});
    }

    var initModule=dataGraphMapping();
    it('inizialization',function(){
      expect(true).toEqual(typeof initModule.links == 'function');
    });

    it('links - get set links',function(){
      var links=new Array({link:1},{link:2})
      initModule.links(links);
      expect(links).toEqual(initModule.links());
    });

    it('nodes - get set Nodes',function(){
      var nodes=new Array({nodes:1},{nodes:2})
      initModule.nodes(nodes);
      expect(nodes).toEqual(initModule.nodes());
    });

    it('filter - get set filter',function(){
      var filter='filtro'
      initModule.filter(filter);
      expect(filter).toEqual(initModule.filter()[0]);
    });

    it('_removeNodesInLink - remove node in link',function(){
       var nodes=new Array();
       nodes.push({field:"cluster_h",value:'primo',count:1});
       nodes.push({field:"cluster_h",value:'secondo',count:10});
       nodes.push({field:"cluster_h",value:'terzo',count:13});
       nodes.push({field:"cluster_h",value:'quarto',count:11});
       nodes.push({field:"cluster_h",value:'quinto',count:14});

       var nodesToRemove=new Array(1,3,4);
       initModule._removeNodesInLink(nodes,nodesToRemove);
       expect(2).toEqual(nodes.length);
    });


    /* if the cluster has been already found return false */
    it('_linkNodeMap  - already found flag true',function(){
      initData1();
      var filteredNodes=new Array();
      var found=initModule._linkNodeMap(link,'Cluster1','source',nodes[2],true,filteredNodes);
      expect(found).toEqual(true);
    });

    /* if the cluster has been already found return false */
    it('_linkNodeMap - not already found, and it is not found here',function(){
      initData1();
      var filteredNodes=new Array();
      var flag1=initModule._linkNodeMap(link,'Cluster1','source',nodes[2],false,filteredNodes);
      expect(0).toEqual(filteredNodes.length);
      expect(flag1).toEqual(false);
    });

    it('_linkNodeMap - node found flag true and filteredNodes filled cluster reference indexed cluster1',function(){
      initData1();
      var filteredNodes=new Array();
      var flag1=initModule._linkNodeMap(link,'Cluster1','source',nodes[1],false,filteredNodes,initModule._pushFilteredNode);
      expect(1).toEqual(filteredNodes.length);
      expect('secondo').toEqual(filteredNodes[0].name);
      expect(0).toEqual(link.source);
      expect(flag1).toEqual(true);
    });

    it('_linkNodeMap - node found flag true and filteredNodes filled cluster reference indexed -cluster2',function(){
      initData1();
      var filteredNodes=new Array();
      var flag1=initModule._linkNodeMap(link,'Cluster2','target',nodes[4],false,filteredNodes,initModule._pushFilteredNode);
      expect(1).toEqual(filteredNodes.length);
      expect('quinto').toEqual(filteredNodes[0].name);
      expect(0).toEqual(link.target);
      expect(flag1).toEqual(true);
    });

    it('_linkNodeMap - node found flag true and filteredNodes filled cluster reference indexed -cluster2',function(){
      initData1();
      var filteredNodes=new Array();
      var link1={Cluster1:['primo'],Cluster2:['terzo']};
      var link2={Cluster1:['secocondo'],Cluster2:['terzo']};
      var link3={Cluster1:['quinto'],Cluster2:['terzo']};
      var flag1=initModule._linkNodeMap(link1,'Cluster2','target',nodes[2],false,filteredNodes,initModule._pushFilteredNode);
      var flag1=initModule._linkNodeMap(link2,'Cluster2','target',filteredNodes[0],false,0,initModule._getIndexFilteredNode);
      var flag1=initModule._linkNodeMap(link3,'Cluster2','target',filteredNodes[0],false,0,initModule._getIndexFilteredNode);
      expect(1).toEqual(filteredNodes.length);
      expect('terzo').toEqual(filteredNodes[0].name);
      expect(0).toEqual(link1.target);
      expect(0).toEqual(link2.target);
      expect(0).toEqual(link3.target);
      expect(flag1).toEqual(true);
    })

  it('test-f',function(){
      var filteredNodes=new Array();
      var links=new Array();

      link={Cluster1:['quinto'],Cluster2:['terzo']};//qui


      var nodes=new Array();

      filteredNodes.push({field:"cluster_h",value:'primo',count:1});
      filteredNodes.push({field:"cluster_h",value:'terzo',count:13});
      filteredNodes.push({field:"cluster_h",value:'secondo',count:10});


      nodes.push({field:"cluster_h",value:'quarto',count:11});
      nodes.push({field:"cluster_h",value:'quinto',count:14});
      nodes.push({field:"cluster_h",value:'sesto',count:13});
      nodes.push({field:"cluster_h",value:'settimo',count:11});//qui
      nodes.push({field:"cluster_h",value:'ottavo',count:14});//qui

      var initModule=dataGraphMapping();

      var found1=false;
      var found2=false;
      var nodeToRemove=[];
      for(var i=0; i<filteredNodes.length; i++){
        found1=initModule._linkNodeMap(link,'Cluster1','source',filteredNodes[i],found1,i,initModule._getIndexFilteredNode);
        found2=initModule._linkNodeMap(link,'Cluster2','target',filteredNodes[i],found2,i,initModule._getIndexFilteredNode);
        if(found1 && found2){break;}
      }
      if(!(found1 && found2)){
        for(var k=0; k<nodes.length; k++){
          if(!found1){
            found1=initModule._linkNodeMap(link,'Cluster1','source',nodes[k],found1,filteredNodes,initModule._pushFilteredNode);
            found1 && nodeToRemove.push(k);
          }
          if(!found2){
            found2=initModule._linkNodeMap(link,'Cluster2','target',nodes[k],found2,filteredNodes,initModule._pushFilteredNode);
            found2 && nodeToRemove.push(k);
          }
          if(found1 && found2) {break;}
        }
        initModule._removeNodesInLink(nodes,nodeToRemove);
      }
      expect(true).toEqual(found1 && found2);
  });

  it('_linkIndexer - with links array',function(){
    var filteredNodes=new Array();
    var links=new Array();

    links.push({Cluster1:['quinto'],Cluster2:['terzo']});//qui


    var nodes=new Array();

    filteredNodes.push({field:"cluster_h",value:'primo',count:1});
    filteredNodes.push({field:"cluster_h",value:'secondo',count:10});
    filteredNodes.push({field:"cluster_h",value:'terzo',count:13});

    nodes.push({field:"cluster_h",value:'quarto',count:11});
    nodes.push({field:"cluster_h",value:'quinto',count:14});
    nodes.push({field:"cluster_h",value:'sesto',count:13});
    nodes.push({field:"cluster_h",value:'settimo',count:11});//qui
    nodes.push({field:"cluster_h",value:'ottavo',count:14});//qui

    var initModule=dataGraphMapping();
    var filter;
    var indexedLinks=[];
    for(var i=0; i<links.length; i++){
        if(!filter ||initModule._isFilterInCluster(filter,links[i].Cluster1[0],links[i].Cluster2[0])){
          initModule._linkIndexer(links[i],nodes,filteredNodes) &&  indexedLinks.push(links[i]);
        }
      }
    expect(1).toEqual(indexedLinks.length);
    });


    it('_linkIndexer',function(){
      var filteredNodes=new Array();
      var links=new Array();
      links.push({Cluster1:['primo'],Cluster2:['terzo']});
      links.push({Cluster1:['secondo'],Cluster2:['terzo']});
      links.push({Cluster1:['quinto'],Cluster2:['terzo']});//qui
      links.push({Cluster1:['quinto'],Cluster2:['sesto']});
      links.push({Cluster1:['quinto'],Cluster2:['primo']});//qui
      links.push({Cluster1:['quinto'],Cluster2:['ottavo']});//qui
      links.push({Cluster1:['primo'],Cluster2:['sesto']});//qui
      links.push({Cluster1:['settimo'],Cluster2:['sesto']});//qui

      var nodes=new Array();

      nodes.push({field:"cluster_h",value:'primo',count:1});
      nodes.push({field:"cluster_h",value:'secondo',count:10});
      nodes.push({field:"cluster_h",value:'terzo',count:13});//qui
      nodes.push({field:"cluster_h",value:'quarto',count:11});
      nodes.push({field:"cluster_h",value:'quinto',count:14});//qui
      nodes.push({field:"cluster_h",value:'sesto',count:13});//qui
      nodes.push({field:"cluster_h",value:'settimo',count:11});//qui
      nodes.push({field:"cluster_h",value:'ottavo',count:14});//qui


      //initModule._linkIndexer(links[0],nodes,filteredNodes)

       // expect(2).toEqual(filteredNodes.length);
       // expect(0).toEqual(links[0].Cluster1);
       // expect(1).toEqual(links[0].Cluster2);
       var result1=initModule._linkIndexer(links[0],nodes,filteredNodes);
       var result2=initModule._linkIndexer(links[1],nodes,filteredNodes);
       var result3=initModule._linkIndexer(links[2],nodes,filteredNodes);
       var result4=initModule._linkIndexer(links[3],nodes,filteredNodes);
       var result5=initModule._linkIndexer(links[4],nodes,filteredNodes);
       var result6=initModule._linkIndexer(links[5],nodes,filteredNodes);
       var result7=initModule._linkIndexer(links[6],nodes,filteredNodes);
       var result8=initModule._linkIndexer(links[7],nodes,filteredNodes);

       expect(7).toEqual(filteredNodes.length);
       expect('quinto').toEqual(filteredNodes[3].name);
       expect(1).toEqual(nodes.length);
       expect(true).toEqual(result1);
       expect(true).toEqual(result2);
       expect(true).toEqual(result3);//qui
       expect(true).toEqual(result4);
       expect(true).toEqual(result5);//qui
       expect(true).toEqual(result6);//qui
       expect(true).toEqual(result7);//qui
       expect(true).toEqual(result8);//qui
      // var map=initModule
      //   .nodes(nodes)
      //   .links(links)
      //   .build();
      //   console.log(map.filteredNodes);
      //   expect(7).toEqual(map.filteredNodes().length);
      //   expect(1).toEqual(map.indexedLinks().lenght);


    });


    it('build - simulation',function(){
      var filteredNodes=new Array();
      var links=new Array();

      links.push({Cluster1:['primo'],Cluster2:['terzo']});
      links.push({Cluster1:['secondo'],Cluster2:['terzo']});
      links.push({Cluster1:['quinto'],Cluster2:['terzo']});
      links.push({Cluster1:['quinto'],Cluster2:['sesto']});
      links.push({Cluster1:['quinto'],Cluster2:['primo']});
      links.push({Cluster1:['secondo'],Cluster2:['sesto']});
      links.push({Cluster1:['primo'],Cluster2:['sesto']});
      links.push({Cluster1:['settimo'],Cluster2:['sesto']});

      var nodes=new Array();
      nodes.push({field:"cluster_h",value:'primo',count:1});
      nodes.push({field:"cluster_h",value:'secondo',count:10});
      nodes.push({field:"cluster_h",value:'terzo',count:13});
      nodes.push({field:"cluster_h",value:'quarto',count:11});
      nodes.push({field:"cluster_h",value:'quinto',count:14});
      nodes.push({field:"cluster_h",value:'sesto',count:13});
      nodes.push({field:"cluster_h",value:'settimo',count:11});
      nodes.push({field:"cluster_h",value:'ottavo',count:14});
      var initModule=dataGraphMapping();
      // initModule
      //   .nodes(nodes)
      //   .links(links)
      //   .build();

      //expect(7).toEqual(initModule.filteredNodes().length);
      //expect(1).toEqual(initModule.indexedLinks().lenght);
      var newLink=new Array();
      for(let i=0; i<links.length; i++){
        initModule._linkIndexer(links[i],nodes,filteredNodes);
        newLink.push(links[i]);
        // console.log("removing node");
        // console.log(links[i]);
        // console.log("nodes length"+nodes.length);
        // initModule._removeNodesInLink(nodes,links[i]);
        // console.log("nodes length after removing"+nodes.length);
      }

      expect(6).toEqual(filteredNodes.length);
      expect(8).toEqual(newLink.length);
      expect(0).toEqual(newLink[0].source);
      expect(4).toEqual(newLink[7].target);
    });


    it('id filter in cluster',function(){
      var initModule=dataGraphMapping();

      var links=new Array();

      links.push({Cluster1:['primo'],Cluster2:['terzo']});
      links.push({Cluster1:['secondo'],Cluster2:['terzo']});
      links.push({Cluster1:['quinto'],Cluster2:['terzo']});
      links.push({Cluster1:['quinto'],Cluster2:['sesto']});
      links.push({Cluster1:['quinto'],Cluster2:['primo']});
      links.push({Cluster1:['secondo'],Cluster2:['sesto']});
      links.push({Cluster1:['primo'],Cluster2:['sesto']});
      links.push({Cluster1:['settimo'],Cluster2:['sesto']});

      var i=0;
      var filter=['primo','ventordici','terzo'];
      var result=[];
      for(var i=0; i<links.length; i++){
        for(var k=0 ; k<filter.length; k++){
          if(initModule._isFilterInCluster(filter[k],links[i].Cluster1[0],links[i].Cluster2[0])){
            result.push([i,k]);
            break;
          }
        }

      }
      expect(5).toEqual(result.length);
    });


      it('id filter in cluster',function(){
        var initModule=dataGraphMapping();

        var links=new Array();

        links.push({Cluster1:['primo'],Cluster2:['terzo']});
        links.push({Cluster1:['secondo'],Cluster2:['terzo']});
        links.push({Cluster1:['quinto'],Cluster2:['terzo']});
        links.push({Cluster1:['quinto'],Cluster2:['sesto']});
        links.push({Cluster1:['quinto'],Cluster2:['primo']});
        links.push({Cluster1:['secondo'],Cluster2:['sesto']});
        links.push({Cluster1:['primo'],Cluster2:['sesto']});
        links.push({Cluster1:['settimo'],Cluster2:['sesto']});

        var nodes=new Array();
        nodes.push({field:"cluster_h",value:'primo',count:1});
        nodes.push({field:"cluster_h",value:'secondo',count:10});
        nodes.push({field:"cluster_h",value:'terzo',count:13});
        nodes.push({field:"cluster_h",value:'quarto',count:11});
        nodes.push({field:"cluster_h",value:'quinto',count:14});
        nodes.push({field:"cluster_h",value:'sesto',count:13});
        nodes.push({field:"cluster_h",value:'settimo',count:11});
        nodes.push({field:"cluster_h",value:'ottavo',count:14});

        var indexedLinks=[];
        var filteredNodes=[];

        var i=0;
        var filter=[];
        var result=[];
        for(var i=0; i<links.length; i++){
            if(filter.length!=0){
            for(var k=0 ; k<filter.length; k++){
                if(initModule._isFilterInCluster(filter[k],links[i].Cluster1[0],links[i].Cluster2[0])){
                  initModule._linkIndexer(links[i],nodes,filteredNodes) &&  indexedLinks.push(links[i]);
                  break;
                }
              }
            }else{
              initModule._linkIndexer(links[i],nodes,filteredNodes) &&  indexedLinks.push(links[i]);
            }

        }
        expect(6).toEqual(filteredNodes.length);
        expect(8).toEqual(indexedLinks.length);
        expect(0).toEqual(indexedLinks[0].source);
        expect(4).toEqual(indexedLinks[7].target);
      });

    it('build - simulation 2',function(){
      var filteredNodes=new Array();
      var links=new Array();
      links.push({Cluster1:['primo'],Cluster2:['terzo']});
      links.push({Cluster1:['secondo'],Cluster2:['terzo']});
      links.push({Cluster1:['quinto'],Cluster2:['terzo']});
      links.push({Cluster1:['quinto'],Cluster2:['sesto']});
      links.push({Cluster1:['quinto'],Cluster2:['primo']});
      links.push({Cluster1:['secondo'],Cluster2:['sesto']});
      links.push({Cluster1:['primo'],Cluster2:['sesto']});
      links.push({Cluster1:['settimo'],Cluster2:['sesto']});

      var nodes=new Array();
      nodes.push({field:"cluster_h",value:'primo',count:1});
      nodes.push({field:"cluster_h",value:'secondo',count:10});
      nodes.push({field:"cluster_h",value:'terzo',count:13});
      nodes.push({field:"cluster_h",value:'quarto',count:11});
      nodes.push({field:"cluster_h",value:'quinto',count:14});
      nodes.push({field:"cluster_h",value:'sesto',count:13});
      nodes.push({field:"cluster_h",value:'settimo',count:11});
      nodes.push({field:"cluster_h",value:'ottavo',count:14});

      var initModule=dataGraphMapping();
      initModule
         .nodes(nodes)
         .links(links)
         .build();

      //without filters even the nodes without a link are gave back
      expect(8).toEqual(initModule.filteredNodes().length);
      expect(8).toEqual(initModule.indexedLinks().length);
      expect(0).toEqual(initModule.indexedLinks()[0].source);
      expect(4).toEqual(initModule.indexedLinks()[7].target);
    });

    it('_nodeLinkCompare ',function(){
      var initModule=dataGraphMapping();
      expect(true).toEqual(initModule._nodeLinkCompare("a|b,c","a,b|c"));
      expect(false).toEqual(initModule._nodeLinkCompare("c|b,c","a,b|c"));
    });

    it('_isFilterInCluster - ',function(){
      var initModule=dataGraphMapping();
      expect(true).toEqual(initModule._isFilterInCluster("a|b,c","a,b|c","different"));
      expect(true).toEqual(initModule._isFilterInCluster("a|b,c","different","a,b|c"));
      expect(false).toEqual(initModule._isFilterInCluster("a|b,c","different","different"));
      expect("").toEqual(initModule._isFilterInCluster("","different","different"));
    });

    it('build - with filter',function(){
      var filteredNodes=new Array();
      var links=new Array();
      links.push({Cluster1:['primo'],Cluster2:['terzo']});
      links.push({Cluster1:['secondo'],Cluster2:['terzo']});
      links.push({Cluster1:['quinto'],Cluster2:['terzo']});
      links.push({Cluster1:['quinto'],Cluster2:['sesto']});
      links.push({Cluster1:['quinto'],Cluster2:['primo']});
      links.push({Cluster1:['secondo'],Cluster2:['sesto']});
      links.push({Cluster1:['primo'],Cluster2:['sesto']});
      links.push({Cluster1:['settimo'],Cluster2:['sesto']});

      var nodes=new Array();
      nodes.push({field:"cluster_h",value:'primo',count:1});
      nodes.push({field:"cluster_h",value:'secondo',count:10});
      nodes.push({field:"cluster_h",value:'terzo',count:13});
      nodes.push({field:"cluster_h",value:'quarto',count:11});
      nodes.push({field:"cluster_h",value:'quinto',count:14});
      nodes.push({field:"cluster_h",value:'sesto',count:13});
      nodes.push({field:"cluster_h",value:'settimo',count:11});
      nodes.push({field:"cluster_h",value:'ottavo',count:14});

      var initModule=dataGraphMapping();

      initModule
            .nodes(nodes)
            .links(links)
            .filter("terzo")
            .build();

      expect("terzo").toEqual(initModule.filter()[0]);
      expect(4).toEqual(initModule.filteredNodes().length);
      expect(3).toEqual(initModule.indexedLinks().length);
      expect('primo').toEqual(initModule.filteredNodes()[0].name);
      expect(0).toEqual(initModule.indexedLinks()[0].source);
      expect(1).toEqual(initModule.indexedLinks()[0].target);
      expect(2).toEqual(initModule.indexedLinks()[1].source);
      expect(1).toEqual(initModule.indexedLinks()[1].target);
      expect(3).toEqual(initModule.indexedLinks()[2].source);
      expect(1).toEqual(initModule.indexedLinks()[2].target);
      // expect(0).toEqual(initModule.indexedLinks()[0].source);
      // expect(4).toEqual(initModule.indexedLinks()[7].target);

    });

    it("Build - with urlEncoded filter",function(){
      var filteredNodes=new Array();
      var links=new Array();
      links.push({Cluster1:['primo'],Cluster2:["gun,device,spray,electric"]});
      links.push({Cluster1:['secondo'],Cluster2:["gun,device,spray,electric"]});
      links.push({Cluster1:['quinto'],Cluster2:['terzo']});
      links.push({Cluster1:['quinto'],Cluster2:['sesto']});
      links.push({Cluster1:['quinto'],Cluster2:['primo']});
      links.push({Cluster1:['secondo'],Cluster2:['sesto']});
      links.push({Cluster1:['primo'],Cluster2:['sesto']});
      links.push({Cluster1:['settimo'],Cluster2:['sesto']});

      var nodes=new Array();
      nodes.push({field:"cluster_h",value:'primo',count:1});
      nodes.push({field:"cluster_h",value:'secondo',count:10});
      nodes.push({field:"cluster_h",value:'terzo',count:13});
      nodes.push({field:"cluster_h",value:'quarto',count:11});
      nodes.push({field:"cluster_h",value:'quinto',count:14});
      nodes.push({field:"cluster_h",value:'sesto',count:13});
      nodes.push({field:"cluster_h",value:'settimo',count:11});
      nodes.push({field:"cluster_h",value:'ottavo',count:14});
      nodes.push({field:"cluster_h",value:"gun,device,spray,electric",count:14});

      var filter=decodeURIComponent("gun%2Cdevice%2Cspray%2Celectric");

      var initModule=dataGraphMapping();

      initModule
            .nodes(nodes)
            .links(links)
            .filter(filter)
            .build();

      expect("gun,device,spray,electric").toEqual(initModule.filter()[0]);
      expect(3).toEqual(initModule.filteredNodes().length);
      // expect(3).toEqual(initModule.indexedLinks().length);

      // expect(0).toEqual(initModule.indexedLinks()[0].source);

    });

    it('build - without all the nodes',function(){
      var filteredNodes=new Array();
      var links=new Array();
      links.push({Cluster1:['primo'],Cluster2:['terzo']});
      links.push({Cluster1:['secondo'],Cluster2:['terzo']});
      links.push({Cluster1:['quinto'],Cluster2:['terzo']});
      links.push({Cluster1:['quinto'],Cluster2:['sesto']});
      links.push({Cluster1:['quinto'],Cluster2:['primo']});
      links.push({Cluster1:['secondo'],Cluster2:['sesto']});
      links.push({Cluster1:['primo'],Cluster2:['sesto']});
      links.push({Cluster1:['settimo'],Cluster2:['sesto']});

      var nodes=new Array();
      nodes.push({field:"cluster_h",value:'primo',count:1});
      nodes.push({field:"cluster_h",value:'secondo',count:10});


      var initModule=dataGraphMapping();
      initModule
         .nodes(nodes)
         .links(links)
         .build();

      expect(2).toEqual(initModule.filteredNodes().length);
      expect(0).toEqual(initModule.indexedLinks().length);

    });

    it('build - just one node',function(){
      var filteredNodes=new Array();
      var links=new Array();
      links.push({Cluster1:['plant,named,gun,nail'],Cluster2:['terzo']});
      links.push({Cluster1:['secondo'],Cluster2:['terzo']});
      links.push({Cluster1:['quinto'],Cluster2:['terzo']});
      links.push({Cluster1:['quinto'],Cluster2:['sesto']});
      links.push({Cluster1:['quinto'],Cluster2:['primo']});
      links.push({Cluster1:['secondo'],Cluster2:['sesto']});
      links.push({Cluster1:['primo'],Cluster2:['sesto']});
      links.push({Cluster1:['settimo'],Cluster2:['sesto']});

      var nodes=new Array();
      //nodes.push({field:"cluster_h",value:'secondo',count:10});
      nodes.push({field: "cluster_h", value: "fsd", count: 16});


      var initModule=dataGraphMapping();
      initModule
         .nodes(nodes)
         .links(links)
         .build();

      expect(1).toEqual(initModule.filteredNodes().length);
      expect(0).toEqual(initModule.indexedLinks().length);

    });

    it('build - just two nodes just one is in links and filters',function(){

      // todo : if a node is in
      var filteredNodes=new Array();
      var links=new Array();
      links.push({Cluster1:['plant,named,gun,nail'],Cluster2:['terzo']});
      links.push({Cluster1:['secondo'],Cluster2:['terzo']});
      links.push({Cluster1:['quinto'],Cluster2:['terzo']});
      links.push({Cluster1:['quinto'],Cluster2:['sesto']});
      links.push({Cluster1:['quinto'],Cluster2:['primo']});
      links.push({Cluster1:['secondo'],Cluster2:['sesto']});
      links.push({Cluster1:['primo'],Cluster2:['sesto']});
      links.push({Cluster1:['settimo'],Cluster2:['sesto']});

      var nodes=new Array();
      //nodes.push({field:"cluster_h",value:'secondo',count:10});
      nodes.push({field: "cluster_h", value: "fsd", count: 16});
      nodes.push({field: "cluster_h", value: "secondo", count: 16});


      var initModule=dataGraphMapping();
      initModule
         .nodes(nodes)
         .links(links)
         .filter("secondo")
         .build();

      expect(1).toEqual(initModule.filteredNodes().length);
      expect(0).toEqual(initModule.indexedLinks().length);

    });


    it('build - just one node without link but in filters',function(){

      // todo : if a node is in
      var filteredNodes=new Array();
      var links=new Array();
      links.push({Cluster1:['plant,named,gun,nail'],Cluster2:['terzo']});
      links.push({Cluster1:['secondo'],Cluster2:['terzo']});
      links.push({Cluster1:['quinto'],Cluster2:['terzo']});
      links.push({Cluster1:['quinto'],Cluster2:['sesto']});
      links.push({Cluster1:['quinto'],Cluster2:['primo']});
      links.push({Cluster1:['secondo'],Cluster2:['sesto']});
      links.push({Cluster1:['primo'],Cluster2:['sesto']});
      links.push({Cluster1:['settimo'],Cluster2:['sesto']});

      var nodes=new Array();
      //nodes.push({field:"cluster_h",value:'secondo',count:10});
      nodes.push({field: "cluster_h", value: "fsd", count: 16});


      var initModule=dataGraphMapping();
      initModule
         .nodes(nodes)
         .links(links)
         .filter("secondo")
         .build();

      expect(1).toEqual(initModule.filteredNodes().length);
      expect(0).toEqual(initModule.indexedLinks().length);

    });

  });
});
