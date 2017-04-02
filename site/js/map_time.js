Map.prototype.season_attr = " Season";
Map.prototype.shapeBySeason = function(players) {
  players = players || this.gl.repo.player_data;
  // console.log("data to shape: ");
  // console.log(players);

  var _this = this;
  var s2y = function(d) {
    var first_year = +d[_this.season_attr].substring(0,2);
    return first_year < 20? (2000 + first_year) : (1900 + first_year);
  }
  var annual = d3.nest()
                  .key(s2y)
                  .rollup(function(d) { return d; })
                  .entries(players);
  console.log("annual data: ");
  console.log(annual.map(function(d) {return d.key + " - " + d.values.length}).sort());
  console.log(annual);
}

Map.prototype.zoom = function(d) {
  if(!this.gl.util.getParam("zoom", false)) {
    return;
  }
  if(null == d) return;
  if(null != d.parent) {
    // this.zoom(d.parent);
    return;
  }
  // console.log(d);
  var _this = this;
  var target = this.origin;
  if(d == this.focus) {
    this.focus = null;
    this.zp = this.center;
    target = [d.n.x, d.n.y, d.n.r * 2];
  } else {
    this.focus = d;
    var t = this.carto_transform;
    this.zp = [d.n.x * t[2] + t[0], d.n.y * t[2] + t[1], d.n.r * t[2] * 2];
    target = this.center;
  }
  var n = d.n;
  // console.log("zoom target params: " + target);
  var transition = d3.transition()
      .duration((d3.event && d3.event.altKey) ? 7500 : 350)
      .tween("zoom", function(g) {
        var i = d3.interpolateZoom(_this.zp, target);
        return function(t) {
            var v = _this.zp = i(t);
            // console.log("intermediate zoom params: " + v);
            var k = v[2] / (n.r * 2);
            var tx = v[0] - n.x * k;
            var ty = v[1] - n.y * k;
            _this.carto_transform = [tx, ty, k];
            _this.carto.attr("transform", "translate(" + tx + "," + ty
                          + ")scale(" + k + ")")
                        ;
        };
      });

    // transition.selectAll("text")
    //   .filter(function(d) { return d.parent === focus || this.style.display === "inline"; })
    //     .style("fill-opacity", function(d) { return d.parent === focus ? 1 : 0; })
    //     .each("start", function(d) { if (d.parent === focus) this.style.display = "inline"; })
    //     .each("end", function(d) { if (d.parent !== focus) this.style.display = "none"; });
  }

Map.prototype.centerSquare = function() {
  var size = this.size();
  var e = (size.w > size.h? size.h : size.w);
  // console.log("size: " + w + " x " + h + " min = " + mwh);
  return {"x": (size.w - e) / 2, "y": (size.h - e) / 2, "edge": e};
}

Map.prototype.size = function() {
  var w = +this.ct.attr("width");
  var h = +this.ct.attr("height");
  return {"w": w, "h": h};
}

Map.prototype.prepairZoom = function() {
  var _this = this;
  d3.select("body")
      .on("click", function() { _this.zoom(_this.focus); });
  this.zp = null;
  this.carto_transform = [0, 0, 1];
  this.center = [/* cx */ this.size().w / 2, /*cy*/ this.size().h / 2,
                 /*scale*/ this.centerSquare().edge / 2];
}

Map.prototype.buildTip = function() {
    this.tip = d3.tip().html(this.ellaborate)
                  .attr('class', 'd3-tip')
                  .offset([-10, 0])
                  ;
    this.ct.call(this.tip);
}

Map.prototype.ellaborate = function(d) {
  if(null != d.children) return d.name + ": average MV  £" + Math.round(+d.average_mv).formatMoney(0); // is a club or parent circle
  return  "<table><tbody><tr><td colspan='2' class='ct title'><span class='gtx1'>" + d.parent.name + " - </span><strong> " + d[Repo.prototype.name_attr] + "</strong></td></tr>"
        + "<tr><td class='header'>2015 Rank</td><td>" + d[Map.prototype.rank_attr] + "</td></tr>"
        + "<tr><td class='header'>Market Value</td><td>£" + (+d[Map.prototype.mv_attr]).formatMoney(0) + "</td></tr>"
        // + "<tr><td class='header'>Date of Birth</td><td>" + d[Map.prototype.dob_attr] + "</td></tr>"
        // + "<tr><td class='header'>Field Position</td><td>" + d[Map.prototype.pos_attr] + "</td></tr>"
        + "</tbody><table>";
}
