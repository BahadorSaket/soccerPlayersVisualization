Map.prototype.calcTrans = function(clubs, year) {
  var p2t = this.gl.repo.get("player2trans");
  var n2c = {};
  var ret = [];
  for(var i = 0; i < clubs.length; i++) {
    n2c[clubs[i].name] = clubs[i];
  }
  for(var i = 0; i < clubs.length; i++) {
    var c = clubs[i];
    // console.log(c);
    for(var j = 0; j < c.players.length; j++) {
      var p = c.players[j];
      var name = p[Trans.prototype.name_attr];
      if(!p2t.hasOwnProperty(name)) {
        // console.log("No trans rec for player: " + name);
        continue;
      }
      var r = p2t[name];
      // console.log("trans rec for player: " + name);
      // console.log(r);
      var filtered = r.filter(function(d) { return (+d.year == +year) && (+d.year == 1 + (+d.last_seen)); });
      if(1 > filtered.length) {
        // console.log("No trans rec for player in year " + year + ": " + name);
        continue;
      }
      // console.log("Trans rec found for player " + name + ": ");
      // console.log(filtered[0]);
      var t = filtered[0];
      if(!n2c.hasOwnProperty(t.from)) {
        // console.log("club not in view of " + year + ": " + t.from + " for player " + name);
        continue;
      }
      // console.log("good from club " + t.from + " for player " + name + ", last_seen: " + t.last_seen);
      // console.log(p);
      // console.log(n2c[t.from]);
      ret.push(t);
      t.src = n2c[t.from];
      t.player = p;
    }
  }
  return ret;
}
