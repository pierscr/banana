/**

un esempio di come dovrebbe funzionare il modulo

            return stringFunction()
                .create("translate")
                 .addArgument(d3.event ? d.x + d3.event.transform[0] : d.x)
                 .addArgument(d3.event ? d.y + d3.event.transform[1] : d.y)
                 .end()
               .addFunction("scale")
                 .addArgument()
                 .addArgument()
                 .end()
               .build();
 */

define([],function(){
  // return function(){
  //   var module={
  //     create:create
  //     addArgument:addArgument
  //     end:end
  //     addFunction:addFunction
  //     build:build
  //   }
  //
  //   var string="";
  //   var argStringFlag=false;
  //   var fnStringFlag=false;
  //
  //   function stringRefactor(){
  //     return string + (fnStringFlag && !argStringFlag ?  "(" : "," ) ;
  //   }
  //
  //   function create(fnString){
  //     return (string + fnString) && module;
  //   };
  //
  //   function addArgument(argString){
  //     return argStringFlag=true && (string + stringRefactor() + argString) && module;
  //   }
  //
  //   function end(){
  //
  //   }
  //
  //   function addFunction(fnString){
  //     return (stringRefactor() + fnString) && module;
  //   }
  //
  //   function build(){
  //
  //   }
  //
  // }
});
