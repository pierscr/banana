define('labelTooltip',['d3tip','createLabelRow'],function(d3tip,createLabelRow){

              tipNode = d3tip()
                  .attr('class', 'd3-tip')
                  .style('max-width','400px;')
                  .offset([-10, 0])
                  .html(function(d) {
                    var label = createLabelRow.call({},"")
                        .concat("",d);

                      return label.build();
                    });

              tipNode.setDirectionByTarget=function(event){
                var targetEvent=event.target;
                var xPosition=event.clientX;
                var leftBorder=event.view.outerWidth/3;
                var rightBorder=event.view.outerWidth-leftBorder;
                this.direction(function(d) {
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
