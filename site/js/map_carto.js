
Map.prototype.updateCatograms = function(clubs_in_current_year, year) {
  var _this = this;
  var av_mv_ext = d3.extent(clubs_in_current_year, function(d) { return d.average_mv; });
  if(av_mv_ext[0] == av_mv_ext[1]) {
    av_mv_ext = [300000, 84000000];
  }
  var color_scale = d3.scale.linear()
                      .range(['#ace6be', '#42c66b'])
                      .domain(av_mv_ext);

  this.gl.repo.store("active_clubs", clubs_in_current_year);

  var club_with_player = [];
  clubs_in_current_year.forEach(function(c) {
    // use sqrt root to correct map value into area
    c.n.r = 18.0 * Math.sqrt(c.size);
    c.n.c = _this.projection(c.ll);
    c.n.x = c.n.c[0];
    c.n.y = c.n.c[1];
    c.n.g = {x: c.n.x, y: c.n.y};


  var pack = d3.layout.pack()
                 .padding(1)
                 .size([2 * c.n.r, 2 *c.n.r])
                 .value(function(d) { return d.size; });
    club_with_player.push.apply(club_with_player, pack.nodes(c));
  });

  var trans_rec = this.calcTrans(clubs_in_current_year, year);

  var bd_traj = this.traj.selectAll("path").data(trans_rec);
  var entering_traj = bd_traj.enter()
         .append("path")
         .attr("class", "movementPath")
         .attr("d", _this.linkArc)
         .attr("marker-end", "url(#suit)");
  var all_traj = this.traj.selectAll("path");
  var exiting_traj = bd_traj.exit().remove();
  // var entering_rects = this.labels.selectAll("rect").data(clubs_in_current_year).enter()
  // .append("rect")
  // .attr("x", function(d) { return d.n.x - 2; })
  // .attr("y", function(d) { return d.n.y - 2; })
  // .attr("width", 4)
  // .attr("height", 4)
  // .style("opacity", 0.5);

    // Create approximal inital layout
    var nodes = clubs_in_current_year.map(function(d) { return d.n });
    // force layout, makes circles closer.
    // This is useful when circle radius changes.
    force = d3.layout.force()
              .alpha(0.005)
              .size([this.ct.attr("width"),this.ct.attr("height")])
              .nodes(nodes);// collision detection, prevents circles from overlapping each other

    force.start();
    // for(var i = 0; i < 100; i++) {
    //   force.tick();
    //   console.log("static alpha: " + force.alpha());
    //   // if(force.alpha() < 0.01) break;
    // }

  var bd_circles = this.circles.selectAll("circle").data(club_with_player)

 /*
  var entering_circles = bd_circles.enter()
        .append("circle")
        .attr("stroke-width", function(c) { return (null != c.children? 0 : .5) })
        .attr("stroke", function(c) {
          return "black";
        })
        .on('mouseover', function(d){
           d3.selectAll("circle").style("stroke-wdidth", "black");
           d3.select(this).style("stroke","red");
           console.log(d);
        });

   entering_circles.append("svg:a")
        .attr("xlink:href", function (d) { //hyperlinks

        return "http://www.example.com/entityform/";
    })
 */


/* Added by Bahador  */
Number.prototype.formatMoney = function(decPlaces, thouSeparator, decSeparator) {
    var n = this,
        decPlaces = isNaN(decPlaces = Math.abs(decPlaces)) ? 2 : decPlaces,
        decSeparator = decSeparator == undefined ? "." : decSeparator,
        thouSeparator = thouSeparator == undefined ? "," : thouSeparator,
        sign = n < 0 ? "-" : "",
        i = parseInt(n = Math.abs(+n || 0).toFixed(decPlaces)) + "",
        j = (j = i.length) > 3 ? j % 3 : 0;
    return sign + (j ? i.substr(0, j) + thouSeparator : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + thouSeparator) + (decPlaces ? decSeparator + Math.abs(n - i).toFixed(decPlaces).slice(2) : "");
};

// var tip = d3.tip()
//   .attr('class', 'd3-tip')
//   .offset([-10, 0])
//   .html(function(d) {
//    return "<strong>"+(null != d.children?  "Club : " : "Player : ")+"</strong> <span style='color:red'>"
//                      +(null != d.children? d.key : d.Name)+ "</span> <br>"
//                      +"<strong>"+(null != d.children?  " " : "Market Value : ")+"</strong> <span style='color:red'> "
//                      +(null != d.children? " " : "&pound;"+ (d.MV).formatMoney(2,',','.'))+ "</span>";
//   })


/**/


 var entering_circles = bd_circles.enter()
        .append("circle")
        .attr("class", "state")
        .attr("stroke", function(c) {
          return "black";
        })
       .on('mouseover', this.tip.show)
        .on('mouseout', this.tip.hide)
        .on("click", function(d) {
            d3.selectAll(".line").style("opacity",0.5);
            d3.selectAll(".line").style("stroke-width",1);
            // filter the line chart (and show detail box) if clicking on a player (child node)
            // otherwise don't filter and hide the detail box
            if(null == d.children)
            {
                club_names = [];
                club_names.push(d.Name);
                FilteredLineChart(club_names);
            } else {
                getClubPlayerList(d.key);
              $('.details-box').html('Select a player to view details');
            }
            _this.zoom(d);
            d3.event.stopPropagation();
        })
        //.call(tip);

        // .attr("cx",function(c) { return (null != c.children? /*is parent*/c.n.x : c.parent.n.x - c.parent.x + c.x); })
        // .attr("cy",function(c) { return (null != c.children? /*is parent*/c.n.y : c.parent.n.y - c.parent.y + c.y); })
        // .attr("r", function(c) { return (null != c.children? c.n.r : c.r); })
        // .style("opacity", 1)
        // .style("fill", function(c) { return color_scale(null != c.children? c.average_mv : +c[Map.prototype.mv_attr]); });
        // this.labels.selectAll("rect").remove();
  var all_circles = this.circles.selectAll("circle")
        .attr("cx",function(c) { return (null != c.children? /*is parent*/c.n.x : (c.parent.n.x - c.parent.x + c.x)); })
        .attr("cy",function(c) { return (null != c.children? /*is parent*/c.n.y : (c.parent.n.y - c.parent.y + c.y)); })
        .attr("r", function(c) { return (null != c.children? c.n.r : c.r); })
        .style("fill", function(c) { return color_scale(null != c.children? c.average_mv : +c[Map.prototype.mv_attr]); });




  var exit_circles = bd_circles.exit().remove();

  var bd_labels = this.labels.selectAll("text").data(clubs_in_current_year);
  var entering_labels = bd_labels.enter()
                .append("text")
                .text(function(d) { return d.name; })
                .style("font-family","Arial, 'Helvetica Neue', Helvetica, sans-serif;")
                // .style("stroke","white")
                .style("font-weight","900");
  var all_labels = this.labels.selectAll("text")
                .text(function(d) { return d.name; })
                .style("font-size", function(d) { return 5 + d.n.r * 0.15; })
                // .style("stroke-width",function(d){return d.n.r*0.004})
                .attr("class", "team_label tm numb");
  var exiting_labels = bd_labels.exit().remove();

  force.on("tick", function(e) {
    // console.log("force progress" + e.alpha);
    var k = e.alpha,
      kg = k * .02,
      spaceAround = 0.;

    nodes.forEach(function(a, i) {
    // Apply gravity forces.
    a.x += (a.g.x - a.x) * kg;
    a.y += (a.g.y - a.y) * kg;

    nodes.slice(i + 1).forEach(function(b) {
      var dx = a.x - b.x,
          dy = a.y - b.y,
          l = Math.sqrt(dx * dx + dy * dy),
          d = a.r + b.r + 40;
      if (l < d) {
        l = (l - d) / l * k;
        dx *= l;
        dy *= l;
        a.x -= dx;
        a.y -= dy;
        b.x += dx;
        b.y += dy;
      }
    });
    });
    all_circles.attr("cx",function(c) { return (null != c.children? /*is parent*/c.n.x : (c.parent.n.x - c.parent.x + c.x)); })
           .attr("cy",function(c) { return (null != c.children? /*is parent*/c.n.y : (c.parent.n.y - c.parent.y + c.y)); });
    all_labels.attr("x", function(d) { return d.n.x; })
          .attr("y", function(d) { return d.n.y; });
    // _this.gl.tower.broardcast("clubs_moved", null);
    all_traj.attr("d", _this.linkArc)
            ;
  });
}

Map.prototype.linkArc = function(d) {
  var c = d.player.parent;
  var s = {"x": d.src.n.x, "y": d.src.n.y};
  var t = {"x": c.n.x - c.x + d.player.x, "y": c.n.y - c.y + d.player.y};
  var dx = t.x - s.x,
      dy = t.y - s.y,
      dr = Math.sqrt(dx * dx + dy * dy);
  return "M" + s.x + "," + s.y + "A" + dr + "," + dr + " 0 0,1 " + t.x + "," + t.y;
}
