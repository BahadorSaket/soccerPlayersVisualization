function Map(g) {
  this.gl = g; // Global object holds common instances, not graphics
  this.ct = g.chart; // Container
  this.ready = false;
  this.group = null;
  this.carto = null;
}

Map.prototype.init = function() {

  // arrow-headsvg.append("defs").selectAll("marker")
  this.ct.append("defs").selectAll("marker")
    .data(["suit", "licensing", "resolved"])
    .enter().append("marker")
    .attr("id", function(d) { return d; })
    .attr("viewBox", "0 -5 10 10")
    .attr("refX", 8)
    .attr("refY", 0)
    .attr("markerWidth", 6)
    .attr("markerHeight", 6)
    .attr("orient", "auto")
  .append("path")
    .attr("d", "M0,-5L10,0L0,5");
  this.group = this.ct.append("g");
  this.carto = this.ct.append("g");
  this.circles = this.carto.append("g");
  this.labels = this.carto.append("g");
  this.traj = this.carto.append("g");

  // var _this = this;
  this.makeProjection();
  this.buildTip();
  // setTimeout(function() { _this.makeZoomButtons(); }, 900);
  // setTimeout(function() { _this.shapeBySeason(null); }, 1200);
  this.gl.tower.intercept("filter_any", this.makeCarograms, this);
  // this.gl.tower.intercept("player_data_ready", this.makeCarograms, this);
  this.prepairZoom();
}

Map.prototype.makeProjection = function() {
  //map type & center point
  this.projection = d3.geo.mercator()
      .center([0, 45])
      .scale(700);
      // .scale(2 * (this.ct.attr("width") + 1) / 2 / Math.PI);
  var _this = this;
  // this.path = d3.geo.path().projection(this.projection);

  // d3.json("data/country_contours.json", function(obj){
  //   _this.populateCountries(obj);
  // });
}
Map.prototype.mv_attr = "MV";
Map.prototype.dob_attr = "DOB";
Map.prototype.city_attr = "City";
Map.prototype.pos_attr = "Field position";
Map.prototype.rank_attr = "2015 Rank";
Map.prototype.calcAndShowCityMV = function() {
  var raw = __gl.repo.player_data;
  // console.log("mv_attr" + this.mv_attr);
  // console.log("Player data length: " + raw.length + ", content: ");
  // console.log(raw);
  var _this = this;
  var cities = d3.nest()
    .key(function(d) { return d[_this.city_attr]})
    .rollup(function(d) {
      return {
        "latitude": +d[0].Latitude
        ,"longitude": +d[0].Longitude
        ,"average_mv": d3.sum(d, function(g) { return +g[_this.mv_attr]; }) / d3.sum(d, function(g) { return 1; })
      };
    }).entries(raw);
  console.log("group by city, array length: " + cities.length);
  // console.log("After nest, global player data: ");
  // Check if global data is altered after nest()
  // console.log(this.gl.repo.player_data);
  this.populateCities(cities.map(function(d){ return d.values}));
}

Map.prototype.populateCities = function(csv) {
  var _this = this;
 for (var i=0; i<csv.length; ++i) {
    //  csv[i].latitude = Number(csv[i].Latitude);
    //   csv[i].longitude = Number(csv[i].Longitude);

       //csv[i].MVNumber = Number(csv[i].MVNumber);
 }



 var MVNumber = d3.extent(csv, function(row) { return row.average_mv;}); // [min, max]
 console.log("mv range: " + MVNumber);

var ColorScale1 = d3.scale.linear().domain(
       [d3.min(MVNumber),(d3.min(MVNumber)+d3.max(MVNumber))/2,d3.max(MVNumber)])
   .range(["#f03b20","#feb24c","#ffeda0"]);
_this.country.selectAll("circle")
     .data(csv)
     .enter()
     .append("circle")
     .attr("cx", function(d) {
             return _this.projection([d.longitude, d.latitude])[0];
     })
     .attr("cy", function(d) {
             return _this.projection([d.longitude, d.latitude])[1];
     })
     .attr("r", 4)
    //  .style("fill", "#994422");
     .style("fill", function(d) {return ColorScale1(d.average_mv)});
 // console.log(csv);
}

Map.prototype.highlight = function() {
  // this.country.setlect
  this.country.selectAll("path")
      .style("fill", function(d) {  return d.interest? "#A3E42C" : "#43a2ca"});
}

Map.prototype.populateCountries = function(obj) {
  // this.country = this.group.append("g");
  // var _this = this;
  // this.country.selectAll("path")
  //       .data(obj.features)
  //       .enter()
  //       .append("path")
  //       .attr("title", function(d) { return d.id; })
  //       .style("fill", "#43a2ca")
  //       .attr("d", this.path) // What a handy func
  //       // .on("mouseover", function(e) { _this.hoverCountry(e); })
  //       // .on("mouseout", function(e) { _this.leaveCountry(e); });
  //
  //   var zoom = d3.behavior.zoom()
  //    .on("zoom",function() {
  //        _this.country.attr("transform","translate("+
  //            d3.event.translate.join(",")+")scale("+d3.event.scale+")");
  //       //  _this.country.selectAll("circle")
  //       //      .attr("d", path.projection(_this.projection));
  //       //  _this.country.selectAll("path")
  //       //      .attr("d", path.projection(_this.projection));
  //  });
  //
  // this.ct.call(zoom).on("dblclick.zoom", null);
  // this.makeCarograms(obj);
  // this.calcAndShowCityMV();
  // d3.csv("data/club-location.csv", function(csv) { _this.populateCities(csv)});
}

Map.prototype.hoverCountry = function(d) {
  d.interest = true;
  // console.log("Hover " + d.p.n);
  this.highlight();
}

Map.prototype.leaveCountry = function(d) {
  d.interest = false;
  this.highlight();
  // console.log("Leave " + d.p.n);
}
