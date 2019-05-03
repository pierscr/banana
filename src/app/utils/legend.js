//option {colorScale:<color_scale>,colorField:<color_field>}

define('legend',['d3'],function(d3){
  var _opt;

  return {
    init:init
  }

  function draw(selection){
    var legend = selection.selectAll(".legend")
        .data(_opt.colorScale.domain())
        .enter().append("g")
        .attr("class", "legend")
        .attr("transform", function (d, i) {
            return "translate(0," + i * 20 + ")";
        })
        .on("mouseover", function () {
            el.style.cursor = 'pointer';
        })
        .on("mouseout", function () {
            el.style.cursor = 'auto';
        })
        .on("click", function (d) {
            filterSrv.set({
                type: 'terms',
                field: _opt.colorField,
                value: d,
                mandate: 'must'
            });

            el.style.cursor = 'auto';
            //dashboard.refresh();
        });
    legend.append("text")
        .attr("x", _opt.width - 24)
        .attr("y", 9)
        .attr("dy", ".35em")
        .style("text-anchor", "end")
        .text(function (d) {
            return d;
        });
    legend.append("rect")
        .attr("x", _opt.width - 18)
        .attr("width", 18)
        .attr("height", 18)
        .style("fill", _opt.colorScale);
  }

  function init(_optPar){
    _opt=_optPar;
    return draw;
  }

});
