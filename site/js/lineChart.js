

function visualizeLineChart(dataBOB, nested)
{


var parseDate = d3.time.format("%d-%b-%Y").parse;

  dataBOB.forEach(function(d) {
   // d.Season = parseDate(d.Season);
    if(d.MV=="-")
    {
          d.MV=0;
    }
    else
    {
        d.MV = +d.MV;
    }
  
  })

 
  var margin = {top: 30, right: 20, bottom: 60, left: 80},
    width = 800 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

// Parse the date / time

// Set the ranges
var x = d3.time.scale().range([0, width]);
var y = d3.scale.linear().range([height, 0]);

// Define the axes
var xAxis = d3.svg.axis().scale(x)
    .orient("bottom").ticks(6);

var yAxis = d3.svg.axis().scale(y)
    .orient("left").ticks(5).tickFormat(d3.format("s"));

// Define the line
var priceline = d3.svg.line() 
    .x(function(d) { return x(parseDate(d.Season)); })
    .y(function(d) { return y(d.MV); });
    
// Adds the svg canvas
d3.select("body").select(".lineChart").remove();

var svg = d3.select("body").select("#chart")
        .append("svg")
        .attr("class","lineChart")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", 
              "translate(" + margin.left + "," + margin.top + ")");


    // Scale the range of the data
    x.domain(d3.extent(dataBOB, function(d) { return parseDate(d.Season); }));
    y.domain([-100, d3.max(dataBOB, function(d) { return d.MV; })]);

    // Nest the entries by symbol

   var tooltip = d3.select("body").append("div")   
                  .attr("class", "tooltip")               
                  .style("opacity", 0);

     
    // Loop through each symbol / key
    nested.forEach(function(d) {
        svg.append("path")
            .attr("class", "line linechartPath")
            .style("opacity", 0.5)
            .attr("id",function(){ return d.key;})
            .attr("d", priceline(d.values))
            .on("mouseover", function(d) {   
              tooltip.style("opacity", .9);      
              tooltip.html(d3.select(this).attr("id"))  
                .style("left", (d3.event.pageX-25) + "px")     
                .style("top", (d3.event.pageY-34) + "px");    
            })                  
            .on("mouseout", function(d) {       
              tooltip.style("opacity", 0);   
            })
            .on("click", function(d) {
                d3.selectAll(".line").style("opacity",0);
                d3.selectAll(".line").style("stroke-width",0);
                var name=[];
                name.push(d3.select(this).attr("id"));
			        	FilteredLineChart(name);
                d3.select(this).style("opacity",1);
                d3.select(this).style("stroke-width",3);

            })
            .on("contextmenu", function (d, i) {
            d3.event.preventDefault();
             d3.selectAll(".line").style("opacity",0.5);
              d3.selectAll(".line").style("stroke-width",1);
           // react on right-clicking
           });
    });

   svg.append("g")
       .attr("class", "x axis")
       .attr("transform", "translate(0," + height + ")")
       .call(xAxis)
       .append("text")
       .attr("x", 700)
       .attr("y", 50)
       .style("text-anchor", "end")
       .text("Time (by year)");



   // Add the Y Axis
   svg.append("g")
       .attr("class", "y axis")
       .call(yAxis) 
       .append("text")
       .attr("transform", "rotate(-90)")
       .attr("y", 6)
       .attr("dy", ".71em")
       .style("text-anchor", "end")
       .text("Market Value (in pounds)");


  


}


function FilteredLineChart(name)
{

  for(i=0;i<name.length;i++)
  {
     console.log("Main name: +"+name[i]);
    
  }
  
  d3.selectAll(".line").each(function(d)
  {
    checker = false;
     for(k=0;k<name.length;k++)
     {
        if(d3.select(this).attr("id") == name[k])
        {
            var year = $('#slider').slider("option", "value");
            year = "1-Jan-"+year;
            //calls the details
            if(name.length<=1)
            {
              var player_details = getPlayerDetails(name[k], year);
              populateDetailBox(player_details);
            }
                
            d3.select(this).classed("selected", true);
            checker= true;
        }
     }
     if(checker==false)
      {
             d3.select(this).style("opacity",0);
             d3.select(this).style("stroke-width",0);
      }
  });
}
