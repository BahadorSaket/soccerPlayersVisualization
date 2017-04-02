function Repo(g) {
  this.gl = g;
  this.player_data = null;
  this.player_data_orig = null;
  this.memo = {};
}

Repo.prototype.loadPlayerData = function() {
  var dataset = this.gl.util.getParam("dataset", "final_player_data");
  var _this = this;
  d3.csv("data/" + dataset + ".csv", function(raw) {
    console.log("raw csv length: " + raw.length);
    _this.player_data_orig = raw;
    _this.player_data = _this.filter(raw);
    _this.gl.player_data = _this.player_data; // for compatibility
    console.log("filtered length: " + _this.player_data.length);
    _this.gl.tower.broardcast("player_data_ready", _this.gl.player_data);
  });
}
Repo.prototype.name_attr = "Name";
Repo.prototype.club_attr = "Club";
Repo.prototype.filter = function(dataset) {
  if(null == dataset || 0 == dataset.length) return [];
  var am = {};
  var rep = {};
  for(var i = 0; i < dataset.length; i++) {
    var ele = dataset[i];
    // var k0 = ele[this.name_attr] + "," + ele[Map.prototype.season_attr];
    // if(rep.hasOwnProperty(k0)) {
    //   rep[k0].push(ele[this.club_attr]);
    // } else {
    //   rep[k0] = [ele[this.club_attr]];
    // }
    var key = ele[this.name_attr] + "_" + ele[Map.prototype.season_attr] + "_" + ele[this.club_attr];
    if(am.hasOwnProperty(key)) {
      // console.log("Dropped duplicate " + key);
      // console.log(ele);
      // console.log(am[key]);
      continue;
    }
    am[key] = ele;
  }
  var ret = [];
  for(var k in am) {
    ret.push(am[k]);
  }
  // var out = []
  // for(var k0 in rep) {
  //   if(2 > rep[k0].length) continue;
  //   out.push(k0 + "," + rep[k0].join(","));
  // }
  // console.log(out.join("\n"));
  return ret;
}

Repo.prototype.store = function(key, value) {
  if(null == key || 0 == key.length) {
    console.log("NULL or empty key specified! ");
    return;
  }
  if(key in this.memo) {
    console.log("Updating value for key: " + key);
  }
  this.memo[key] = value;
}

Repo.prototype.get = function(key, fallback) {
  return (key in this.memo? this.memo[key] : fallback);
}
