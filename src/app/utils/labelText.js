define('labelText',
  [
    'd3',
    'labelTooltip'
  ],function(d3,labelTooltip){
    return function(descriptor,node,scope,dashboard){
      var self=this;
      self.labelPersistTrigger=false;
      self.stillOnOverFlag=true;

      var labelTextLength=scope.panel.labelTextLength || 20;

      descriptor.setLabelLimit(scope.panel.labelNumberLimit);
      descriptor.setLabelTextLength(scope.panel.labelTextLength);
      descriptor.setPatentCodeField(scope.panel.patentCodeField);

      function openTooltip(data,targetEvent){
        labelTooltip.setDirectionByTarget(d3.event)
        descriptor.getDescription(data.secondLevel,scope,dashboard)
          .thenRun(function(description){
            if(self.stillOnOverFlag){
              labelTooltip
                .show(description,targetEvent);
            }
          });
      }

      if(scope.panel.label){
        var textLabel2=node
                .append('text')
                .attr('class','clusterText')
                .attr('x',0)
                .attr('y',-20)
                .style('font-size',scope.panel.fontSize+'px')
                .style('pointer-events', 'auto')

          textLabel2
              .append('tspan')
              .append('tspan')      //2nd part of label
              .attr("class", "label")
              .text(function(d){
                var returnText=d.value.substr(0,labelTextLength);
                if(labelTextLength<d.value.length){
                  returnText+="...";
                }
                return returnText;
            })
        }


      if(scope.panel.patent){
        var textColourClass='clusterPatentCodes';
        if(scope.panel.label)
            var textColourClass='clusterText';

        var textLabel=node
                .append('text')
                .attr('class','clusterPatentCodes')
                .attr('x',0)
                .attr('y',-5)
                .style('font-size',scope.panel.fontSize+'px')
                .style('pointer-events', 'auto')

        textLabel.selectAll('.label')
            .data(descriptor.createDataLabel)
            .enter()
            .append('tspan')
            .append('tspan')      //2nd part of label
            .attr("class", "label")
            .text(function(d,i){
                if(i>=scope.panel.maxNumberOfPantetCodes)
                  return;
                var text= " "+d.firstLevel+" ";
                var returnText=text.substr(0,labelTextLength);
                if(labelTextLength<text.length){
                  returnText+="...";
                }
                return returnText;
          })
          .on('mouseover', function(data,event){
              var targetEvent=d3.event.target;
              self.stillOnOverFlag=true;
              if(d3.event.target.className.baseVal !='bubble' && !self.labelPersistTrigger){
                labelTooltip.setDirectionByTarget(d3.event)
                descriptor.getDescription(data.secondLevel,scope,dashboard)
                  .thenRun(function(description){
                    if(self.stillOnOverFlag){
                      labelTooltip
                        .show(description,targetEvent);
                    }
                  });
              }
            })
          .on('mouseout', function(){
            self.stillOnOverFlag=false;
            if(!self.labelPersistTrigger)
                labelTooltip.hide();
          })
          .on('click', function(data,event){
            if(d3.event.target.className.baseVal !='bubble'){
              console.log("click self.labelPersistTrigger=true")
              self.labelPersistTrigger=true;
              openTooltip(data,event);
              outEventAppend();
            }
          })
      }


      function outEventAppend(){
        d3.selectAll('.labelTooltip')
           .on('mouseleave',null);

        d3.selectAll('.labelTooltip')
           .on('mouseleave', function(){
              labelTooltip.hide();
              self.labelPersistTrigger=false;
            });
      }



    }
});
