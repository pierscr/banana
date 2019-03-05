'use strict';


define(['grid','cluster_data','rangeDate'],function(grid,data,rangeDate){


  function initGrid(){
    var myGridL=grid();
    return myGridL
    .setDataProcessor(myGridL.plainDataProcessor())
    .rowField("name")
    .colField("year")
    .size([300,300])
  }

  var links=[
         {"Cluster1": ["flower|case|device|watering"],"Cluster2": ["flower|case|device|watering|test"],"value": [0.29499688199934504]},
         {"Cluster1": ["gun,flower,device,machine"],"Cluster2": ["flower|case|device|watering"],"value": [0.054597872395713454]},
         {"Cluster1": ["material,fabric,flower,anti"],"Cluster2": ["flower|case|device|watering"],"value": [0.046069246728398294]}
  ];

  var nodes=[
              {id:0,value:"flower|case|device|watering",year:"2016"},
              {id:1,value:"flower|case|device|type",year:"2016"},
              {id:2,value:"gun,flower,device,machine",year:"2016"},
              {id:3,value:"flower|case|device|watering|test",year:"2017"},
              {id:4,value:"material,fabric,flower,anti",year:"2017"},
              {id:5,value:"flower|case|device|watering|test2",year:"2018"}
            ]


  describe('init',function(){
    it('init',function(){
      expect('object').toEqual(typeof grid(data));
    });



  });

  describe('Target functionalities',function(){
    var myGrid=grid(nodes,links);
    var processor=myGrid.plainDataProcessor();
    processor.getXDomain=rangeDate(2016,1,2018).getRange;


    myGrid
    .setDataProcessor(processor)
    .rowField("name")
    .colField("year")
    .size([300,300])
    .build();

    it('init',function(){
      expect('object').toEqual(typeof grid(nodes));
      expect('object').toEqual(typeof myGrid.nodes(3));
      expect(300).toEqual(myGrid.size()[0]);
    });

    it('get node list',function(){

      var nodo4=myGrid.nodes(0);
      //var link1=myGrid.linkList(0);
      //this node must contains data for node col 0 row 3
      expect(0).toEqual(myGrid.nodes(0).col);
      expect(0).toEqual(myGrid.nodes(0).row);
      expect(30).toEqual(myGrid.nodes(0).x);
      expect(30).toEqual(myGrid.nodes(0).y);

      expect(0).toEqual(myGrid.nodes(1).col);
      expect(1).toEqual(myGrid.nodes(1).row);
      expect(30).toEqual(myGrid.nodes(1).x);
      expect(150).toEqual(myGrid.nodes(1).y);

      expect(0).toEqual(myGrid.nodes(2).col);
      expect(2).toEqual(myGrid.nodes(2).row);
      expect(30).toEqual(myGrid.nodes(2).x);
      expect(270).toEqual(myGrid.nodes(2).y);

      expect(1).toEqual(myGrid.nodes(3).col);
      expect(0).toEqual(myGrid.nodes(3).row);
      expect(150).toEqual(myGrid.nodes(3).x);
      expect(30).toEqual(myGrid.nodes(3).y);

      expect(1).toEqual(myGrid.nodes(4).col);
      expect(1).toEqual(myGrid.nodes(4).row);
      expect(150).toEqual(myGrid.nodes(4).x);
      expect(150).toEqual(myGrid.nodes(4).y);

      expect(2).toEqual(myGrid.nodes(5).col);

      // expect(200).toEqual(nodo4.size);
      // expect('#ffff').toEqual(nodo4.color);
      // expect(100).toEqual(link1.source.x)
      // expect(200).toEqual(link1.source.y)
    })

    it('get links list',function(){
      var links=myGrid.links();
      //console.log(myGrid.links());
      expect(3).toEqual(links.length);
      //expect(30).toEqual(myGrid.links(0).x1);
      //expect(150).toEqual(myGrid.links(2).x1);
      expect(myGrid.nodes(0).x).toEqual(links[2].x2);
      expect(30).toEqual(links[2].y2);
    })

  });


  describe('Target additive node functionalities',function(){

    // var nodes=[
    //             {id:0,"cluster_h":"flower|case|device|watering",value:"210",year:"2016"},
    //             {id:1,"cluster_h":"flower|case|device|type",value:"120",year:"2016"},
    //             {id:2,"cluster_h":"gun,flower,device,machine",value:"60",year:"2016"},
    //             {id:3,"cluster_h":"flower|case|device|watering",value:"250",year:"2017"},
    //             {id:4,"cluster_h":"material,fabric,flower,anti",value:"35",year:"2017"},
    //             {id:5,"cluster_h":"flower|case|device|watering",value:"310",year:"2018"}
    //           ]

    var myGrid=grid();
    myGrid
    .setDataProcessor(myGrid.plainDataProcessor())
    .rowField("name")
    .colField("year")
    .size([300,300])

    it('just adding nodes and link after initialization',function(){

      myGrid
        .addNode(nodes)
        .addLink(links)
        .build();

        expect(0).toEqual(myGrid.nodes(1).col);
        expect(1).toEqual(myGrid.nodes(1).row);
        expect(30).toEqual(myGrid.nodes(1).x);
        expect(150).toEqual(myGrid.nodes(1).y);

        expect(3).toEqual(links.length);

        expect(myGrid.nodes(0).x).toEqual(myGrid.links(0).x1);//
        expect(150).toEqual(myGrid.links(2).x1);
        expect(myGrid.nodes(0).x).toEqual(links[2].x2);
        expect(30).toEqual(links[2].y2);

    })

    it('just adding nodes and link after initialization',function(){

      myGrid=initGrid()
        .addNode(nodes)

      myGrid.build();

        expect(0).toEqual(myGrid.nodes(1).col);
        expect(1).toEqual(myGrid.nodes(1).row);
        expect(30).toEqual(myGrid.nodes(1).x);
        expect(150).toEqual(myGrid.nodes(1).y);


    })

    it('adding link after a building',function(){

      myGrid=initGrid()
        .addNode(nodes)

      myGrid.build();


        expect(0).toEqual(myGrid.nodes(1).col);
        expect(1).toEqual(myGrid.nodes(1).row);
        expect(30).toEqual(myGrid.nodes(1).x);
        expect(150).toEqual(myGrid.nodes(1).y);

        myGrid
          .addLink(links)
          .build();

        expect(3).toEqual(links.length);
        expect(30).toEqual(myGrid.links(0).x1);
        expect(150).toEqual(myGrid.links(2).x1);
        expect(myGrid.nodes(0).x).toEqual(links[2].x2);
        expect(30).toEqual(links[2].y2);

    })


  });

    describe('range functions test',function(){

      it('check the result type (array) ',function(){

        var range=rangeDate(2000,2,2005);
        expect(true).toEqual(Array.isArray(range.getRange()));

        expect(3).toEqual(range.getRange().length);

      });

      it('check single result of getRange ',function(){

        var range=rangeDate(2000,2,2015);
        expect('2000-2001').toEqual(range.getRange(0));

        expect('2002-2003').toEqual(range.getRange(1));

        expect('2004-2005').toEqual(range.getRange(2));

      });

      it('get all the array getRange',function(){

        var range=rangeDate(2000,2,2015);

        expect('2000-2001').toEqual(range.getRange()[0]);

        expect('2002-2003').toEqual(range.getRange()[1]);

        expect('2004-2005').toEqual(range.getRange()[2]);

      })

      it('check single result of getRange ',function(){

        var range=rangeDate(2000,2,2006);

        //console.log(range.getRange())

        expect(4).toEqual(range.getRange().length);

        expect('2000-2001').toEqual(range.getRange(0));

        expect('2002-2003').toEqual(range.getRange(1));

        expect('2004-2005').toEqual(range.getRange(2));

        expect('2006').toEqual(range.getRange(3));

      });

      it('check single result of getRange ',function(){

        var range=rangeDate(2000,1,2006);

        expect(7).toEqual(range.getRange().length);

        expect('2000').toEqual(range.getRange(0));

        expect('2001').toEqual(range.getRange(1));

        expect('2003').toEqual(range.getRange(3));

      });

      it('check single result of getRange ',function(){

        expect('2006-2008').toEqual(rangeDate(2000,3,2019).getRange()[2])

      });


    });

    describe('data processor xDomainFn setting',function(){

      var nodes=[
                  {id:0,value:"flower|case|device|watering",value:"210",year:"2000-2003"},
                  {id:1,value:"flower|case|device|type",value:"120",year:"2004-2007"},
                  {id:2,value:"flower|case|device|type",value:"120",year:'2008-2011'},
                  {id:3,value:"flower|case|device|type",value:"120",year:'2012-2015'},
                  {id:4,value:"flower|case|device|type",value:"120",year:'2016-2019'}
                ]


      var myGrid=grid(nodes,links);
      var processor=myGrid.plainDataProcessor();
      processor.getXDomain=rangeDate(2000,4,2019).getRange;


      myGrid=grid()

      var processor=myGrid.plainDataProcessor();
      processor.getXDomain=rangeDate(2000,4,2019).getRange;

      myGrid
      .setDataProcessor(processor)
      .rowField("name")
      .colField("year")
      .size([400,400])
      .build();

      myGrid.addNode(nodes)
      .build();

      expect([ '2000-2003', '2004-2007', '2008-2011', '2012-2015', '2016-2019']).toEqual(rangeDate(2000,4,2019).getRange());

      expect(0).toEqual(myGrid.nodes(0).col);
      expect(0).toEqual(myGrid.nodes(0).row);
      expect(22.22222222222222).toEqual(myGrid.nodes(0).x);
      //expect(150).toEqual(myGrid.nodes(0).y);

      expect(1).toEqual(myGrid.nodes(1).col);
      expect(0).toEqual(myGrid.nodes(1).row);
      expect(111.11111111111111).toEqual(myGrid.nodes(1).x);
      expect(200).toEqual(myGrid.nodes(2).x);
      expect(288.88888888888886).toEqual(myGrid.nodes(3).x);
      expect(377.77777777777777).toEqual(myGrid.nodes(4).x);

      //expect(150).toEqual(myGrid.nodes(1).y);

      expect(true).toEqual(true);

    })

    describe('data processor xDomainFn setting',function(){

      var nodes=[
                  {id:0,"cluster_h":"flower|case|device|watering",value:"210",year:"2000-2002"},
                  {id:1,"cluster_h":"flower|case|device|watering",value:"210",year:"2000-2002"}
                ]



      var myGrid=grid();

      var processor=myGrid.plainDataProcessor();
      processor.getXDomain=rangeDate(2000,3,2019).getRange;

      myGrid
      .setDataProcessor(processor)
      .rowField("name")
      .colField("year")
      .size([400,400])
      .build();

      myGrid.addNode(nodes)
      .build();

      //expect([ '2000-2003', '2004-2007', '2008-2011', '2012-2015', '2016-2019']).toEqual(myGrid.nodes(0));

      expect(0).toEqual(myGrid.nodes(0).col);
      expect(0).toEqual(myGrid.nodes(0).row);

      expect(0).toEqual(myGrid.nodes(1).col);
      expect(1).toEqual(myGrid.nodes(1).row);


    });

    describe('split range result',function(){

        //first year
        expect(['2006','2008']).toEqual(rangeDate(2000,3,2019).getRange()[2].split("-"));

        //first year
        expect(['2002']).toEqual(rangeDate(2000,1,2019).getRange()[2].split("-"));

    });

    // descireb('two step grid building',function{
    //
    //   var nodesStep1=[
    //               {"name":"flower|case|device|watering",value:"210",year:"2000-2002"},
    //               {"name":"flower|case|device|watering",value:"210",year:"2000-2002"}
    //             ]
    //
    //   var nodesStep2=[
    //               {"name":"flower|case|device|watering",value:"210",year:"2000-2002"},
    //               {"name":"flower|case|device|watering",value:"210",year:"2000-2002"}
    //             ]
    //
    // })

    describe('_nodeIndexing function to add id to a list of node',function(){
        var array=new Array({a:1},{a:2});
        var nodeIndexing=grid()._nodeIndexing(array);
        expect(0).toEqual(array[0].id);
        expect(1).toEqual(array[1].id);

        var array2=new Array({a:5},{a:8});

        nodeIndexing.addNodes(array2);


        expect(4).toEqual(nodeIndexing.getNodes().length);
        expect(3).toEqual(nodeIndexing.getNodes()[3].id);

        var array3=new Array({a:5},{a:8});

        nodeIndexing.addNodes(array3);

        expect(3).toEqual(nodeIndexing.getNodes()[3].id);
        expect(5).toEqual(nodeIndexing.getNodes()[5].id);

    });



    describe('grid graph integragion',function(){

        var nodesStep1=[
                    {field:"cluster_h",value:"primo",year:"2000-2002"},
                    {field:"cluster_h",value:"secondo",year:"2000-2002"}
                  ]

        var myGrid=grid();

        var processor=myGrid.plainDataProcessor();
        processor.getXDomain=rangeDate(2000,3,2019).getRange;

        myGrid.addNode(nodesStep1);

        myGrid
        .setDataProcessor(processor)
        .rowField("cluster_h")
        .colField("year")
        .size([400,400])
        .build();


        expect(0).toEqual(myGrid.nodes(0).row);
        expect(0).toEqual(myGrid.nodes(0).col);

        expect(1).toEqual(myGrid.nodes(1).row);
        expect(0).toEqual(myGrid.nodes(0).col);

        var nodesStep2=[
                    {field:"cluster_h",value:"terzo",year:"2003-2005"},
                    {field:"cluster_h",value:"quarto",year:"2003-2005"}
                  ];

        var link2=new Array();

        link2.push({Cluster1:['primo'],Cluster2:['terzo']});
        link2.push({Cluster1:['primo'],Cluster2:['quarto']});

        myGrid
          .addNode(nodesStep2)
          .addLink(link2)
          .build();

          expect(0).toEqual(myGrid.nodes(0).row);
          expect(0).toEqual(myGrid.nodes(0).col);

          expect(1).toEqual(myGrid.nodes(1).row);
          expect(0).toEqual(myGrid.nodes(0).col);

          expect(myGrid.nodes(0).x).toEqual(myGrid.links(0).x1);
          expect(myGrid.nodes(0).y).toEqual(myGrid.links(0).y1);

          expect(myGrid.nodes(2).x).toEqual(myGrid.links(0).x2);
          expect(myGrid.nodes(2).y).toEqual(myGrid.links(0).y2);

          expect(myGrid.nodes(0).x).toEqual(myGrid.links(1).x1);
          expect(myGrid.nodes(0).y).toEqual(myGrid.links(1).y1);

          expect(myGrid.nodes(3).x).toEqual(myGrid.links(1).x2);
          expect(myGrid.nodes(3).y).toEqual(myGrid.links(1).y2);

          var link3=new Array();

          link3.push({Cluster1:['terzo'],Cluster2:['primo']});
          link3.push({Cluster1:['terzo'],Cluster2:['quarto']});

          myGrid
            .addLink(link3)
            .build();

            // for(var i=0;i<myGrid.links().length;i++){
            //   console.log(myGrid.links(i))
            // }

            expect(0).toEqual(myGrid.nodes(0).row);
            expect(0).toEqual(myGrid.nodes(0).col);

            expect(1).toEqual(myGrid.nodes(1).row);
            expect(0).toEqual(myGrid.nodes(0).col);


            // for(var i=0;i<myGrid.links().length;i++){
            //   console.log(myGrid.links(i))
            // }
            //
            // console.log(myGrid.links(2).x1)

            expect(myGrid.nodes(2).x).toEqual(myGrid.links(2).x1);
            expect(myGrid.nodes(2).y).toEqual(myGrid.links(2).y1);

            expect(myGrid.nodes(0).x).toEqual(myGrid.links(2).x2);
            expect(myGrid.nodes(0).y).toEqual(myGrid.links(2).y2);

            expect(myGrid.nodes(2).x).toEqual(myGrid.links(3).x1);
            expect(myGrid.nodes(2).y).toEqual(myGrid.links(3).y1);

            expect(myGrid.nodes(3).x).toEqual(myGrid.links(3).x2);
            expect(myGrid.nodes(3).y).toEqual(myGrid.links(3).y2);


    });


      describe('check node col by year range',function(){


        var nodesStep1=[
                    {field:"cluster_h",value:"primo",year:"2000-2002"},
                    {field:"cluster_h",value:"secondo",year:"2000-2002"}
                  ]

        var nodesStep2=[
                    {field:"cluster_h",value:"secondo",year:"2003-2005"},
                    {field:"cluster_h",value:"terzo",year:"2003-2005"}
                  ];

        var myGrid=grid();
        var processor=myGrid.plainDataProcessor();

        processor.getXDomain=rangeDate(2000,3,2019).getRange;

        myGrid
        .setDataProcessor(processor)
        .rowField("cluster_h")
        .colField("year")
        .size([400,400]);

        myGrid
          .addNode(nodesStep2)
          .addNode(nodesStep1)
          .stepFn(0)
          .build();

        var test=processor.getXDomain().findIndex(function(currentValue){return (currentValue === "2003-2005")});

        for(var i=0;i<myGrid.nodes().length;i++){
          if(myGrid.nodes(i).year==="2003-2005"){
            expect(1).toEqual(myGrid.nodes(i).col);
          }
        }

      });
      //quando viene buildata la griglia bisogna collegare soltanto i nodi relativi allo step corrente, altrimenti verranno connessi nodi nello stesso step (stesso intervallo di anni/colonna) o a step precedenti (colonna precedente)
      describe('link-binding only for current step',function(){
        //simulazione step2


        var nodesStep1=[
                    {field:"cluster_h",value:"primo",year:"2000-2002"},
                    {field:"cluster_h",value:"secondo",year:"2000-2002"}
                  ]

        var nodesStep2=[
                    {field:"cluster_h",value:"secondo",year:"2003-2005"},
                    {field:"cluster_h",value:"terzo",year:"2003-2005"}
                  ];

        var link=new Array();

        link.push({Cluster1:['primo'],Cluster2:['secondo']});
        link.push({Cluster1:['terzo'],Cluster2:['primo']});


        var myGrid=grid();
        var processor=myGrid.plainDataProcessor();
        processor.getXDomain=rangeDate(2000,3,2019).getRange;

        myGrid
        .setDataProcessor(processor)
        .rowField("cluster_h")
        .colField("year")
        .size([400,400]);


        myGrid
          .addNode(nodesStep2)
          .addNode(nodesStep1)
          .addLink(link)
          .stepFn(0)
          .build();

        // for(var i=0;i<myGrid.nodes().length;i++){
        //   console.log(myGrid.nodes(i))
        // }
        //
        // for(var i=0;i<myGrid.links().length;i++){
        //   console.log(myGrid.links(i))
        // }

        //console.log(rangeDate(2000,3,2019).getRange("2003-2005"))

        expect(76.92307692307692).toEqual(myGrid.links(0).x2)
        expect(66.66666666666667).toEqual(myGrid.links(0).y2)

        expect(undefined).toEqual(myGrid.links(1))

      });

      describe('test wrong crossing',function(){
        var nodeList=[
          {"field":"cluster_h","value":"internet,game,money,advertisement/money,advertisement,transaction,recording/money,advertisement,advertising,game/money,contest,site,farm/site,lecture,image,item","count":78,"year":"2000-2001","x":15.947368421052632,"y":9.210526315789474,"row":0,"col":0},
          {"field":"cluster_h","value":"internet,game,money,advertisement/game,simulation,advertisement,stock/game,advertisement,stock,internet","count":45,"year":"2000-2001","x":15.947368421052632,"y":46.05263157894737,"row":1,"col":0},{"field":"cluster_h","value":"internet,game,money,advertisement/internet,game,site,money/internet,game,site,money","count":40,"year":"2000-2001","x":15.947368421052632,"y":82.89473684210527,"row":2,"col":0},
          {"field":"cluster_h","value":"internet,game,money,advertisement/information,space,stock,internet/information,stock,internet,network/information,network,wedding,user","count":26,"year":"2000-2001","x":15.947368421052632,"y":119.73684210526318,"row":3,"col":0},
          {"field":"cluster_h","value":"internet,game,money,advertisement/money,advertisement,transaction,recording/money,advertisement,advertising,game/money,contest,site,farm/money,game,point,auction","count":25,"year":"2000-2001","x":15.947368421052632,"y":156.57894736842107,"row":4,"col":0},
          {"field":"cluster_h","value":"internet,game,money,advertisement/money,advertisement,transaction,recording/money,advertisement,advertising,game/advertisement,money,game,stock/advertisement,game,sale,stock","count":22,"year":"2000-2001","x":15.947368421052632,"y":193.42105263157896,"row":5,"col":0},
          {"field":"cluster_h","value":"internet,game,money,advertisement/money,advertisement,transaction,recording/money,advertisement,advertising,game/advertisement,money,game,stock/money,insurance,site,payment","count":16,"year":"2000-2001","x":15.947368421052632,"y":230.26315789473688,"row":6,"col":0},
          {"field":"cluster_h","value":"internet,game,money,advertisement/money,advertisement,transaction,recording/money,advertisement,advertising,game/advertising,telephone,internet_game,banner/advertising,banner,telephone,internet_game","count":16,"year":"2000-2001","x":15.947368421052632,"y":267.10526315789474,"row":7,"col":0},
          {"field":"cluster_h","value":"internet,game,money,advertisement/money,advertisement,transaction,recording/money,advertisement,advertising,game/money,contest,site,farm/farm","count":12,"year":"2000-2001","x":15.947368421052632,"y":303.94736842105266,"row":8,"col":0},
          {"field":"cluster_h","value":"internet,game,money,advertisement/money,advertisement,transaction,recording/trading,auction,profit,stock/trading,stock,profit,goods/trading,stock,profit,investment","count":12,"year":"2000-2001","x":15.947368421052632,"y":340.7894736842106,"row":9,"col":0},
          {"field":"cluster_h","value":"internet,game,money,advertisement/internet,game,site,money/internet,game,site,money","count":53,"year":"2002-2003","x":79.73684210526316,"y":9.210526315789474,"row":0,"col":1},
          {"field":"cluster_h","value":"internet,game,money,advertisement/game,simulation,advertisement,stock/game,advertisement,stock,internet","count":36,"year":"2002-2003","x":79.73684210526316,"y":46.05263157894737,"row":1,"col":1},
          {"field":"cluster_h","value":"internet,game,money,advertisement/money,advertisement,transaction,recording/money,advertisement,advertising,game/advertisement,money,game,stock/money,insurance,site,payment","count":23,"year":"2002-2003","x":79.73684210526316,"y":82.89473684210527,"row":2,"col":1},
          {"field":"cluster_h","value":"internet,game,money,advertisement/money,advertisement,transaction,recording/money,advertisement,advertising,game/advertisement,money,game,stock/advertisement,game,sale,stock","count":20,"year":"2002-2003","x":79.73684210526316,"y":119.73684210526318,"row":3,"col":1},
          {"field":"cluster_h","value":"internet,game,money,advertisement/information,space,stock,internet/information,stock,internet,network/information,network,wedding,user","count":19,"year":"2002-2003","x":79.73684210526316,"y":156.57894736842107,"row":4,"col":1},
          {"field":"cluster_h","value":"internet,game,money,advertisement/money,advertisement,transaction,recording/money,advertisement,advertising,game/money,contest,site,farm/contest,student","count":16,"year":"2002-2003","x":79.73684210526316,"y":193.42105263157896,"row":5,"col":1},
          {"field":"cluster_h","value":"electronic_commerce,agent,exhibition,internet/electronic_commerce,agent,transaction,purchase/electronic_commerce,agent,purchase","count":13,"year":"2002-2003","x":79.73684210526316,"y":230.26315789473688,"row":6,"col":1},
          {"field":"cluster_h","value":"electronic_commerce,agent,exhibition,internet/electronic_commerce,internet,agent,payment/electronic_commerce,agent,payment,internet/electronic_commerce,payment,internet,agent","count":13,"year":"2002-2003","x":79.73684210526316,"y":267.10526315789474,"row":7,"col":1},
          {"field":"cluster_h","value":"network,communication,terminal,management/communication,terminal,network,advertisement/communication,network,terminal,information","count":13,"year":"2002-2003","x":79.73684210526316,"y":303.94736842105266,"row":8,"col":1},
          {"field":"cluster_h","value":"internet,game,money,advertisement/money,advertisement,transaction,recording/transaction,stock,function,cash/stock,transaction,investment,function/stock,transaction,game,advertisement","count":12,"year":"2002-2003","x":79.73684210526316,"y":340.7894736842106,"row":9,"col":1},
          {"field":"cluster_h","value":"internet,game,money,advertisement/game,simulation,advertisement,stock/game,advertisement,stock,internet","count":15,"year":"2004-2005","x":143.5263157894737,"y":9.210526315789474,"row":0,"col":2},
          {"field":"cluster_h","value":"internet,game,money,advertisement/money,advertisement,transaction,recording/money,advertisement,advertising,game/money,contest,site,farm/site,lecture,image,item","count":10,"year":"2004-2005","x":143.5263157894737,"y":46.05263157894737,"row":1,"col":2},
          {"field":"cluster_h","value":"internet,game,money,advertisement/internet,game,site,money/internet,game,site,money","count":7,"year":"2004-2005","x":143.5263157894737,"y":82.89473684210527,"row":2,"col":2},
          {"field":"cluster_h","value":"internet,game,money,advertisement/money,advertisement,transaction,recording/payment,coin,money,commerce/payment,money,commerce,credit","count":4,"year":"2004-2005","x":143.5263157894737,"y":119.73684210526318,"row":3,"col":2},
          {"field":"cluster_h","value":"internet,game,money,advertisement/money,advertisement,transaction,recording/shopping_mall,product,store,cyberspace/product,shopping_mall,cyberspace,property","count":4,"year":"2004-2005","x":143.5263157894737,"y":156.57894736842107,"row":4,"col":2},
          {"field":"cluster_h","value":"internet,game,money,advertisement/service,business,providing,real_estate/service,business,internet,employee/service,business,internet,execution/service","count":4,"year":"2004-2005","x":143.5263157894737,"y":193.42105263157896,"row":5,"col":2},
          {"field":"cluster_h","value":"internet,game,money,advertisement/money,advertisement,transaction,recording/money,advertisement,advertising,game/learning,character,real_time,room/character,learning","count":3,"year":"2004-2005","x":143.5263157894737,"y":230.26315789473688,"row":6,"col":2},
          {"field":"cluster_h","value":"internet,game,money,advertisement/money,advertisement,transaction,recording/money,advertisement,advertising,game/money,contest,site,farm/money,game,point,auction","count":3,"year":"2004-2005","x":143.5263157894737,"y":267.10526315789474,"row":7,"col":2},
          {"field":"cluster_h","value":"internet,game,money,advertisement/money,advertisement,transaction,recording/money,advertisement,advertising,game/shopping,mall,account_book,incentive","count":3,"year":"2004-2005","x":143.5263157894737,"y":303.94736842105266,"row":8,"col":2},
          {"field":"cluster_h","value":"internet,game,money,advertisement/money,advertisement,transaction,recording/trading,auction,profit,stock/trading,stock,profit,goods/trading,stock,profit,investment","count":3,"year":"2004-2005","x":143.5263157894737,"y":340.7894736842106,"row":9,"col":2}]
      });

});
