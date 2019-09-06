define('labelTooltip',['d3tip','createLabelRow'],function(d3tip,createLabelRow){

              tipNode = d3tip()
                  .attr('class', 'd3-tip labelTooltip')
                  .style('max-width','400px;')
                  .offset([0, 0])
                  .html(function(d) {
                    var label = createLabelRow.call({},"")
                        .concat("","<div><i class='icon-info-sign'>Click on the label to hold the popup, go with the mouse over the label and leave it for hiding the label</i></div>")
                        .concat("",d)


                      return label.build();
                    });

              tipNode.setDirectionByTarget=function(event){
                var targetEvent=event.target;
                var xPosition=event.clientX;
                var yPosition=event.clientY;
                var leftBorder=event.view.outerWidth/3;
                var topBorder=event.view.outerHeight/3;
                var bottomBorder=event.view.outerHeight-topBorder;
                var rightBorder=event.view.outerWidth-leftBorder;
                this.direction(function(d) {
                  var position="";
                  if(yPosition>topBorder){
                      position+='n';
                  }else{
                      position+='s';
                  }
                  if(xPosition<leftBorder)
                    position+='e';
                  if(xPosition>rightBorder)
                    position+='w';
                  return position;
                })

                return this;
              }

              return tipNode;


});
