Map.prototype.makeZoomButtons = function() {
  this.scale = 1.0;
  this.zoom = this.ct.append("g").attr("transform", "translate(30,30)");
  var c = this.zoom.append("rect")
              .attr("x", 0)
              .attr("y", 0)
              .attr("width", 32)
              .attr("height", 72)
              .attr("class", "wg1");
  this.zoom.append("path")
        .attr("d", "M6,16L26,16M16,6L16,26M6,52L26,52") // + & - together
        .attr("class", "lg3");
  var _this = this;

  var zoom_in = this.zoom.append("rect")
                          .attr("x", 0)
                          .attr("y", 0)
                          .attr("width", 32)
                          .attr("height", 36)
                          .attr("class", "hollow frameless");
  zoom_in.on("click", function(e) { _this.zoomMap(1.1); });
  var zoom_out = this.zoom.append("rect")
                          .attr("x", 0)
                          .attr("y", 36)
                          .attr("width", 32)
                          .attr("height", 36)
                          .attr("class", "hollow frameless");
  zoom_out.on("click", function(e) { _this.zoomMap(0.9); });
}

Map.prototype.zoomMap = function(scale) {
    console.log("scale factor: " + scale);
    if(0 == scale) return;
    if(this.scale < 0.25 || this.scale > 10) return;
    console.log("current scale: " + this.scale);
    this.scale *= scale;
    console.log("new scale: " + this.scale);
    this.group.attr("transform","scale("+ this.scale +")");
}
