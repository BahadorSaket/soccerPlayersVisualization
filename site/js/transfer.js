function Trans(g) {
  this.gl = g;
  this.gl.tower.intercept("player_data_ready", this.lookBack, this);
}

Trans.prototype.name_attr = "Name";
Trans.prototype.club_attr = "Club";
Trans.prototype.lookBack = function(data) {
  var _this = this;
  // console.log("looking back raw: ");
  // console.log(data);
  var indexed_by_player_and_year = d3.nest()
        .key(function(d) { return d[Trans.prototype.name_attr] })
        .key(this.gl.util.season2year)
        .rollup(function(d) { return d; })
        .entries(data);
  var all_trans = [];
  var indexed_by_name = {};
  // console.log("new trans record: ");
  indexed_by_player_and_year.forEach(function(p){
    var name = p.key;
    var years = p.values.sort(function(a, b) { return a.key > b.key; });
    var changes = [];
    years.forEach(function(y, i, l){
      var current_year = y.values[0];
      var to_club = current_year[Trans.prototype.club_attr];
      if(0 == i) {
        changes.push({"to": to_club, "year": y.key, "from": null});
        return;
      }
      var last_year = l[i - 1].values[0];
      var from_club = last_year[Trans.prototype.club_attr];
      if(from_club == to_club) {
        return;
      }
      changes.push({"to": to_club, "year": y.key, "from":from_club, "last_seen": l[i-1].key});
      var r = {"name": name, "year": y.key, "from": from_club, "to": to_club};
      // console.log(r);
      all_trans.push(r);
    });
    if(1 < changes.length) {
      changes.splice(0, 1);
      indexed_by_name[name] = changes;
      // console.log("trans history for " + name);
      // console.log(changes);
    }
  });
  // console.log("trans look back: ");
  // console.log(indexed_by_player_and_year);
  console.log("transfer items in total: " + all_trans.length);
  this.gl.repo.store("all_trans_rec", all_trans);
  this.gl.repo.store("player2trans", indexed_by_name);
  this.gl.tower.broardcast("transition_indexed", null);
}
