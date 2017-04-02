Map.prototype.makeCarograms = function(data) {
  if(null == data || (!data.hasOwnProperty("length")) || 1 > data.length) {
    console.log("Abort on empty filtered dataset:( ");
    return;
  }

  if(!this.gl.util.getParam("fmv", false)) {
    data.forEach(function(d) {
      if(isNaN(parseFloat(d[Map.prototype.mv_attr]))) {
        d[Map.prototype.mv_attr] = 0;
      }
    });
  }
  // calc players in by club
  var club_stats = this.shapeByYearThenClub(data);
  this.gl.repo.store("year_club_indexed", club_stats);

  var _this = this;
  console.log(club_stats);
  var active_year = null;
  var k = null;
  for(k in club_stats) {
    active_year = club_stats[k].clubs;
    break; // get the only one
  }
  if(null == active_year) {
    return;
  }
  console.log("Before filtering: " + active_year.length + ", year = " + k);
  active_year = active_year.filter(function(c) {
    // return (c.ll[0] != 0 && c.ll[1] != 0 && c.size >= 2);
    return (c.ll[0] != 0);
  });
  // console.log("After filtering: " + active_year.length);
  // console.log(active_year);
  this.updateCatograms(active_year, k);
}

Map.prototype.shapeByYearThenClub = function(data) {
// console.log(data);
if(this.gl.util.getParam("fmv", false)) {
  data = data.filter(function(d) {
    var mv = parseFloat(d[Map.prototype.mv_attr]);
    return (!isNaN(mv)) && (0 != mv);
  });
}
// console.log(data);
  var _this = this;
  var s2y = function(d) {
    var first_year = +d[_this.season_attr].substring(0,2);
    return first_year < 20? (2000 + first_year) : (1900 + first_year);
  }
  var yc = d3.nest()
            .key(s2y)
            .key(function(d) { return d[Repo.prototype.club_attr]; })
            .rollup(function(d) { return d; })
            .entries(data);
  // var summary = yc.map(function(d) { return d.key + ": " + d.values.map(function(g){ return g.key + " - " + g.values.length; }).join("\t\n") });
  // console.log(summary);

  // shaping again
  // form {"name": "xxx", "size":6, "ll": [37.32424, NaN], "n":{<force node properties>}}
  var ret = {};
  if(1 < yc.length) {
    console.log("Will only use the first year in year-grouped datasets, out of " + yc.length);
  }
  yc.forEach(function(y, i) {
    if(0 < i) return; // items from the same year only, but I will keep it.
    ret[y.key] = y;
    y.values.forEach(function(e) {
        e.name = e.key;
        e.children = e.players = e.values;
        e.size = e.players.length;
        // console.log(e);
        var mv_ext = d3.extent(e.players, function(d) { return +d[Map.prototype.mv_attr]; });
        var range = [e.size / 5.0, e.size / 2.0];
        var mv_scale = d3.scale.linear().domain(mv_ext).range(range);
        // console.log("extent for club " + e.name + ": " + mv_ext + ", d0 = " + e.size + ", range = " + range);
        if(0 == e.players.length) { console.log("Exception: Empty club! "); }
        e.ll = [parseFloat(e.players[0].Longitude), parseFloat(e.players[0].Latitude)];
        e.n = {};
        if(isNaN(e.ll[0]) || isNaN(e.ll[1])) {
          // console.log("Missing geo lat long for " + e.key, ", default to (0,0)");
          e.ll = [0, 0];
        }
        var missing_cnt = 0;
        var sum = 0;
        for(var j = 0; j < e.players.length; j++) {
          var mv = parseFloat(e.players[j][Map.prototype.mv_attr]);
          if(isNaN(mv)) {
            missing_cnt ++;
            continue;
          }
          sum += mv;
          e.players[j].size = mv_scale(mv);
          // if(0 > e.players[j].size) {
          //   console.log("player size: " + e.players[j].size + ", mv = " + mv + ", rage = " + range);
          // }
        }
        var total = e.players.length - missing_cnt;
        e.average_mv = (0 == total? 0 : (sum / total));
    });
    delete y.key;
    y.clubs = y.values;
    delete y.values;
  });
  return ret;
}
