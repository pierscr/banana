define('labelText',
  [
    'd3',
    'labelTooltip'
  ],function(d3,labelTooltip){
    return function(descriptor,node,scope,dashboard){
      var self=this;
      self.labelPersistTrigger=false;

      if(!scope.panel.patent)
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

            return " "+d.firstLevel+" ";
        })
        .on('mouseover', function(data,event){
            var targetEvent=d3.event.target;
            if(d3.event.target.className.baseVal !='bubble' && !self.labelPersistTrigger){
              labelTooltip.setDirectionByTarget(d3.event)
              descriptor.getDescription(data.secondLevel,scope,dashboard)
                .thenRun(function(description){
                  labelTooltip
                    .show(description,targetEvent);
                });
            }
          })
        .on('mouseout', function(){
          if(!self.labelPersistTrigger)
              labelTooltip.hide();
        })
        .on('click', function(d){
          if(d3.event.target.className.baseVal !='bubble'){
            self.labelPersistTrigger=true;
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
