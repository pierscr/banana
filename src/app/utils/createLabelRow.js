define('createLabelRow',[],function(){
  return function(string){
    string=string || "";
    var self=this;
    this.concat=function(attr,value){
      if(value!="" && value!=undefined){
        string=string.concat("<div><strong>"+attr+"</strong> <span>"+ value +"</span></div>")
      }
      return self;
    }
    this.build=function(){
      return string;
    }
    return self;
  }
})
