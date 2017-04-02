var __gl = { // Global repo for common instances.
   "initialized": false
  ,"min-vis-width": 640
  ,"min-vis-height": 360
  ,"vcap": "Europe rules the soccer world! "
  ,"timeline":{"active_year": 2015}
};

//Gets called when the page is loaded.
function init() {
  if(__gl.initialized) {
    console.log("Ignore duplicated init() call. ");
    return;
  }
  __gl.initialized = true;
  __gl.chart = d3.select('#vis').append('svg').attr("id","svg-cart")
        .call(d3.behavior.zoom().scaleExtent([1, 8]).on("zoom", zoom));
  __gl.util = new Util();
  __gl.tower = new Tower();

  // Instantiate and reference map and other stuff depending on util and trans
  __gl.map = new Map(__gl);

  __gl.repo = new Repo(__gl);
  __gl.trans = new Trans(__gl);

  // setTimeout(function() { d3.select("#vis_cap").text(__gl.vcap); }, 500);
  setTimeout(adjustSize, 300);
  setTimeout(function() {
    __gl.repo.loadPlayerData();
  }, 300);
  __gl.tower.intercept("transition_indexed", function(obj) {
    setDefaultData();
    __gl.map.init();
  })
  d3.select(window).on("resize", adjustSize);
  // load player names for filtering
  loadPlayerNames();

  function zoom() {
    __gl.chart.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
  }

}

function adjustSize() {
  var w0 = d3.select("#pack")[0][0].offsetWidth;
  var wf = d3.select("#filter")[0][0].offsetWidth;
  console.log("w0 = " + w0 + ", wf = " + wf);
  var wr = w0 - wf;
  if(wr < __gl["min-vis-width"]) {
    wr = __gl["min-vis-width"];
  }
  d3.select("#canvas").style("width", wr + "px").style("height", 400);

  var hv = wr * __gl["min-vis-height"] / __gl["min-vis-width"];
  hv = Math.round(hv);
  __gl.chart.attr("width", 1100).attr("height", 1100);
}
