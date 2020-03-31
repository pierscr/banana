define('clusterTooltip',['d3tip','pivotToLabel','createLabelRow'],function(d3tip,pivotToLabel,createLabelRow){

              tipNode = d3tip()
                  .attr('class', 'd3-tip')
                  .style('max-width','400px;')
                  .offset([-10, 0])
                  .html(function(d) {
                    var cluster_levels=(typeof d.name === 'string' ?  d.name.split("/"): d.value.split("/"));
                    var label = createLabelRow.call({},"")
                      .concat("Name",(typeof d.name === 'string' ?  cluster_levels.pop(): cluster_levels.pop()) )
                      .concat("Frequency",d.count)
                      .concat("Level",(typeof d.name === 'string' ?  d.name.split("/").length-1: d.value.split("/").length-1))
                      .concat("",pivotToLabel(d));
                      //.concat("Desc",d.desc);
                      if(d.description!=undefined){
                        var description=d.description.reduce(function(tot,curr, index,arr){
                          if(index % 2 === 0){
                            tot.push(curr);
                          }else{
                            tot[tot.length-1]=tot[tot.length-1]+"("+curr+") ";
                          }
                          return tot;
                        },[]);
                        label.concat("Desc",description);
                      }

                      cluster_levels.map(function(value,index){
                        label.concat("Parent"+index,value);
                      });

                      return label.build();
                    });

              tipNode.setDirectionByTarget=function(event){
                var targetEvent=event.target;
                var xPosition=event.clientX;
                var leftBorder=event.view.outerWidth/3;
                var rightBorder=event.view.outerWidth-leftBorder;
                this.direction(function(d) {
                  //d3.event.clientY
                  if(xPosition<leftBorder)
                    return 'e';
                  if(xPosition>rightBorder)
                    return 'w';
                  return 'n';
                })

                return this;
              }

              return tipNode;


});
