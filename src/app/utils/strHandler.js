define('strHandler',function(){
  'use strict';
  return {
    lstName:lstName
  };

  function lstName(name){
    return name.split("/").pop();
  }
});
