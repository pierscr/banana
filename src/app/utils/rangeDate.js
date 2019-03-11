define('rangeDate',function(){
  'use strict';
  return function(start,step,end){

    var datesRange=build(getNumberOfStep(start,step,end));

    function getNumberOfStep(start,step,end){

      return new Array(Math.floor((end-start)/step)+1);
    }

    function build(dates){
      return dates
        .fill(start)
        .map(function(item,index){
          return _calStepRange(item,step,end,index);
        });
    }

    function _calStepRange(start,step,end,index){
      var startDate=start+(index*step);
      var endDate=(start+((index+1)*step))-1;
      endDate=endDate>end?end:endDate;
      if(startDate===endDate){
        return startDate+"";
      }else{
        return startDate+"-"+endDate;
      }
    }

    function getRange(index){

      if(arguments.length===1){
        return datesRange[index];
      }else{
        return datesRange;
      }
    }

    function getRangeIndexFromYear(dateStr){
      return datesRange.find(function(item){
        return item.year=dateStr;
      });
    }

    return{
      getRange:getRange,
      getRangeIndexFromYear:getRangeIndexFromYear
    };

  };
});
