function Tower() {
  this.m2i = {}; // message to intercepters
}

Tower.prototype.intercept = function(msg, callback, self) {
  if(null == msg || 0 == msg.length) return;
  if(!(msg in this.m2i)) {
    this.m2i[msg] = [];
  }
  // console.log("intercepter added for " + msg + " " + (typeof self));
  this.m2i[msg].push({c:callback, s:self});
}

Tower.prototype.withdraw = function(msg, callback, self) {
  console.log("NOT implemented yet!");
}

Tower.prototype.broardcast = function(msg, data) {
  if(!(msg in this.m2i)) {
    return;
  }
  // console.log("calling intercepters for " + msg + " with data: ");
  // console.log(data);
  var il = this.m2i[msg];
  for(var i = 0; i < il.length; i++) {
    var ir = il[i];
    // console.log("fireing to intercepter: ");
    // console.log(ir.s);
    ir.c.apply(ir.s, [data]);
  }
}
