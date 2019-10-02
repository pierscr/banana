define('labelText',
  [
    'd3',
    'labelTooltip'
  ],function(d3,labelTooltip){
    return function(descriptor,node,scope,dashboard){
      var self=this;
      self.labelPersistTrigger=false;
      self.stillOnOverFlag=true;

      descriptor.setLabelLimit(scope.labelNumberLimit);

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

      if(!scope.panel.label)
        return;
      var textLabel=node
              .append('text')
              .attr('class','clusterText')
              .attr('x',20)
              .attr('y',-10)
              .style('font-size',scope.panel.fontSize+'px')
              .style('pointer-events', 'auto')

      textLabel.selectAll('.label')
          .data(descriptor.createDataLabel)
          .enter()
          .append('tspan')
          .append('tspan')      //2nd part of label
          .attr("class", "label")
          .text(function(d){
            if(scope.panel.patent){
              return " "+d.firstLevel+" ";
            }else{
              return d.secondLevel.pop()+" ";
            }

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
          }
        })

        d3.selectAll('.labelTooltip')
           .on('mouseleave', function(){
              labelTooltip.hide();
              self.labelPersistTrigger=false;
              //filterDialogSrv.hideDialog();
            });
    }
});
