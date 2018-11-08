'use strict';


define(['grid','cluster_data'],function(grid,data){

  var links=[
         {"source": 0,"target": 3,"value": [0.29499688199934504]},
         {"source": 2,"target": 3,"value": [0.054597872395713454]},
         {"source": 4,"target": 5,"value": [0.046069246728398294]}
  ];

  var nodes=[
              {id:0,"name":"flower|case|device|watering",value:"210",year:"2016"},
              {id:1,"name":"flower|case|device|type",value:"120",year:"2016"},
              {id:2,"name":"gun,flower,device,machine",value:"60",year:"2016"},
              {id:3,"name":"flower|case|device|watering",value:"250",year:"2017"},
              {id:4,"name":"material,fabric,flower,anti",value:"35",year:"2017"},
              {id:5,"name":"flower|case|device|watering",value:"310",year:"2018"}
            ]

  describe('init',function(){
    it('init',function(){
      expect('object').toEqual(typeof grid(data));
    });



  });

  describe('Target functionalities',function(){
    var myGrid=grid(nodes,links);
    myGrid
    .setDataProcessor(myGrid.plainDataProcessor)
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
      expect(150).toEqual(myGrid.nodes(4).y)

      // expect(200).toEqual(nodo4.size);
      // expect('#ffff').toEqual(nodo4.color);
      // expect(100).toEqual(link1.source.x)
      // expect(200).toEqual(link1.source.y)
    })

    it('get links list',function(){
      var links=myGrid.links();
      expect(3).toEqual(links.length);
      expect(30).toEqual(myGrid.links(0).x1);
      expect(150).toEqual(myGrid.links(2).x1);
      expect(270).toEqual(links[2].x2);
      expect(30).toEqual(links[2].y2);
    })

  });


});
