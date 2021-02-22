data={}


function plot(date){

  var month=parseInt(d3.timeFormat("%m")(date),10);
  console.log(month);

  //d3.select("#treeMap").select("svg").remove();
  // The svg
  var svg = d3.select("#map"),
  width = +svg.attr("width"),
  height = +svg.attr("height");


  // Map and projection
  var projection = d3.geoNaturalEarth()
  .scale(width / 1.3 / Math.PI)
  .translate([width / 2, height / 2]);



    min=d3.min(data.features,function (d){
      if("trend" in d)
      return d["trend"][month];
      else {
        return 5;
      }
    })
    max=d3.max(data.features,function (d){
      if("trend" in d)
      return d["trend"][month];
      else {
        return -5;
      }
    });
    // min = -0.001076
    // max = 0.019911

    var colorScale=d3.scalePow()
    .domain([min, (max-min)/2,max])
    .range(["blue","green" , "red"])
    .interpolate(d3.interpolateRgb.gamma(2.2))

    // Draw the map
    svg.append("g")
    .selectAll("path")
    .data(data.features)
    .enter().append("path")
    .attr("fill", function (d){
      if("trend" in d)
      return colorScale(d["trend"][month]);
      else {
        return "grey";
      }
    })
    .attr("d", d3.geoPath()
    .projection(projection)
  )
  .style("stroke", "#fff")


}

(function(){
d3.json("https://raw.githubusercontent.com/shokrof/ClimateChangeVisualization/main/world-110m.trends.geojson", function(dataLoaded){
  data=dataLoaded;
  plot(1);
})
})();


(function (){
  var formatDateIntoYear = d3.timeFormat("%b");
  var formatDate = d3.timeFormat("%b");
  var parseDate = d3.timeParse("%m/%d/%y");

  var startDate = new Date("2004-01-01"),
  endDate = new Date("2004-12-01");

  var margin = {top:50, right:50, bottom:0, left:50},
  width = 960 - margin.left - margin.right,
  height = 250 - margin.top - margin.bottom;

  var svg = d3.select("#slider")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom);

  ////////// slider //////////

  var moving = false;
  var currentValue = 0;
  var targetValue = width;

  var playButton = d3.select("#play-button");

  var x = d3.scaleTime()
  .domain([startDate, endDate])
  .range([0, targetValue])
  .clamp(true);

  var slider = svg.append("g")
  .attr("class", "slider")
  .attr("transform", "translate(" + margin.left + "," + height/5 + ")");

  slider.append("line")
  .attr("class", "track")
  .attr("x1", x.range()[0])
  .attr("x2", x.range()[1])
  .select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
  .attr("class", "track-inset")
  .select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
  .attr("class", "track-overlay")
  .call(d3.drag()
  .on("start.interrupt", function() { slider.interrupt(); })
  .on("start drag", function() {
    currentValue = d3.event.x;
    update(x.invert(currentValue));
  })
);

slider.insert("g", ".track-overlay")
.attr("class", "ticks")
.attr("transform", "translate(0," + 18 + ")")
.selectAll("text")
.data(x.ticks(10))
.enter()
.append("text")
.attr("x", x)
.attr("y", 10)
.attr("text-anchor", "middle")
.text(function(d) { return formatDateIntoYear(d); });

var handle = slider.insert("circle", ".track-overlay")
.attr("class", "handle")
.attr("r", 9);

var label = slider.append("text")
.attr("class", "label")
.attr("text-anchor", "middle")
.text(formatDate(startDate))
.attr("transform", "translate(0," + (-25) + ")")


////////// plot //////////



playButton
.on("click", function() {
  var button = d3.select(this);
  if (button.text() == "Pause") {
    moving = false;
    clearInterval(timer);
    // timer = 0;
    button.text("Play");
  } else {
    moving = true;
    timer = setInterval(step, 100);
    button.text("Pause");
  }
  console.log("Slider moving: " + moving);
})


function prepare(d) {
  d.id = d.id;
  d.date = parseDate(d.date);
  return d;
}

function step() {
  update(x.invert(currentValue));
  currentValue = currentValue + (targetValue/151);
  if (currentValue > targetValue) {
    moving = false;
    currentValue = 0;
    clearInterval(timer);
    // timer = 0;
    playButton.text("Play");
    console.log("Slider moving: " + moving);
  }
}



function update(h) {
  // update position and text of label according to slider scale
  handle.attr("cx", x(h));
  label
  .attr("x", x(h))
  .text(formatDate(h));

  plot(h);
}
})();
