/**
 * d3 zoom extension
 */

define(['d3'],function(d3){
  'use strict';

  d3.extensions = d3.extensions || {};
  d3.extensions.zoomBounded=d3.behavior.zoom;
  d3.extensions.zoomBounded=function(){
    var xAssis;
    var onZoomBounded=function(callback){
      var width=this.width.baseVal.value;

      xAssis.rangeRoundBands([0, width * d3.event.scale],0.1);
      var maxLeftTraslate=0;
      var maxRightTraslate=(width * d3.event.scale)-width;
      var finalTranslate=d3.event.translate[0];
      if(d3.event.translate[0] > 0){
        finalTranslate=maxLeftTraslate;
      }
      if(d3.event.translate[0] + maxRightTraslate < 0){
        finalTranslate=-maxRightTraslate;
      }

      zoom.translate([finalTranslate,0]);
        callback(finalTranslate);
      };

    var zoomCallabak;

    var zoom=d3.behavior.zoom();

    zoom.on("zoom",function(){
      onZoomBounded.call(this,zoomCallabak);
    });

    zoom.onZoom=function(userCallback){
      zoomCallabak=userCallback;
      return this;
    };

    zoom.setXaxis=function(x){
        xAssis=x;
        return this;
    };

    return zoom;
  };
});
