/*define('filterDialog',['d3tip',],function(){

  var FilterDialog = function(filter,svg){
    this._filter=filter;
    var dialog = d3tip()
        .attr('class', 'd3-tip')
        .offset([-10, 0])
        .html(function(d) {
            return "<div>test</div>";
        });

    this._dialog=dialog;

    return this;
  };

  FilterDialog.prototype.costructor=FilterDialog;

  FilterDialog.prototype.addTo=function(svg){
    svg.call(this.dialog);
    return this;
  }

  FilterDialog.prototype.filterSrv = function(filterSrv){
      this._filterSrv=filterSrv;
      return this;
  }

  FilterDialog.prototype.show=function(field,value){
    this._filterSrv.set({type:'terms',field:field1,value:value,mandate:'either'});
  }

  var initFn=function(filter,svg){
    return new FilterDialog(filter,svg);
  }

  return initFn;
});
*/
