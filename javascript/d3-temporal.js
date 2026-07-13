// Digital Object 2: Temporal Structure
// A simple D3 timeline using the same visual language:
// off-white background, black forms, red construction line.

var container = d3.select("#d3-container-1");

var width = 600;
var height = 300;

var svg = container
    .append("svg")
    .attr("width", width)
    .attr("height", height);

// background
svg.append("rect")
    .attr("width", width)
    .attr("height", height)
    .attr("fill", "#f2f0e9");

// load the CSV data
d3.csv("data/temporal-data.csv").then(function(data) {

    var parseDate = d3.timeParse("%Y-%m-%d");

    data.forEach(function(d) {
        d.start = parseDate(d.start);
        d.end = parseDate(d.end);
    });

    // x scale: time goes left to right
    var xScale = d3.scaleTime()
        .domain([
            d3.min(data, function(d) { return d.start; }),
            d3.max(data, function(d) { return d.end; })
        ])
        .range([110, 520]);

    // y scale: each row gets a vertical position
    var yScale = d3.scaleBand()
        .domain(data.map(function(d) { return d.name; }))
        .range([70, 220])
        .padding(0.35);

    // red construction baseline
    svg.append("line")
        .attr("x1", 80)
        .attr("y1", 245)
        .attr("x2", 540)
        .attr("y2", 245)
        .attr("stroke", "#aa3c2d")
        .attr("stroke-width", 1);

    // timeline bars
    svg.selectAll(".time-bar")
        .data(data)
        .enter()
        .append("rect")
        .attr("x", function(d) {
            return xScale(d.start);
        })
        .attr("y", function(d) {
            return yScale(d.name);
        })
        .attr("width", function(d) {
            return xScale(d.end) - xScale(d.start);
        })
        .attr("height", yScale.bandwidth())
        .attr("fill", "#111111");

    // labels on the left
    svg.selectAll(".phase-label")
        .data(data)
        .enter()
        .append("text")
        .attr("x", 80)
        .attr("y", function(d) {
            return yScale(d.name) + yScale.bandwidth() / 2 + 4;
        })
        .attr("text-anchor", "end")
        .attr("font-size", "11px")
        .attr("fill", "#111111")
        .text(function(d) {
            return d.name;
        });

    // start and end year labels
    svg.append("text")
        .attr("x", 110)
        .attr("y", 265)
        .attr("font-size", "10px")
        .attr("fill", "#111111")
        .text("JAN 2026");

    svg.append("text")
        .attr("x", 520)
        .attr("y", 265)
        .attr("text-anchor", "end")
        .attr("font-size", "10px")
        .attr("fill", "#111111")
        .text("JUN 2026");

    // red vertical marker
    var markerDate = parseDate("2026-04-01");

    svg.append("line")
        .attr("x1", xScale(markerDate))
        .attr("y1", 55)
        .attr("x2", xScale(markerDate))
        .attr("y2", 245)
        .attr("stroke", "#aa3c2d")
        .attr("stroke-width", 1);

    // small title
    svg.append("text")
        .attr("x", 80)
        .attr("y", 35)
        .attr("font-size", "13px")
        .attr("font-weight", "bold")
        .attr("fill", "#111111")
        .text("Temporal Structure / Design Process");

});