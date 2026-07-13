// Digital Object 2: Temporal Structures
// A simple D3.js timeline using data from a CSV file.

(function() {

    // select the HTML container
    const container = d3.select("#d3-container-1");

    // canvas size
    const width = 600;
    const height = 300;

    // margins inside the SVG
    const margin = {
        top: 40,
        right: 30,
        bottom: 50,
        left: 110
    };

    // actual drawing area
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    // create SVG
    const svg = container
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    // background
    svg.append("rect")
        .attr("width", width)
        .attr("height", height)
        .attr("fill", "#f2f0e9");

    // create chart group
    const chart = svg.append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // load CSV data
    d3.csv("data/temporal-data.csv").then(function(data) {

        // convert start and end from text into numbers
        data.forEach(function(d) {
            d.start = +d.start;
            d.end = +d.end;
        });

        // x scale: maps years to horizontal position
        const xScale = d3.scaleLinear()
            .domain([
                d3.min(data, function(d) { return d.start; }),
                d3.max(data, function(d) { return d.end; })
            ])
            .range([0, chartWidth]);

        // y scale: maps each project phase to vertical position
        const yScale = d3.scaleBand()
            .domain(data.map(function(d) { return d.name; }))
            .range([0, chartHeight])
            .padding(0.35);

        // color scale
        const colorScale = d3.scaleOrdinal()
            .domain(["Thinking", "Making", "Evaluation", "Release", "Memory"])
            .range(["#111111", "#333333", "#666666", "#aa3c2d", "#b8b8b8"]);

        // x axis
        const xAxis = d3.axisBottom(xScale)
            .tickFormat(d3.format("d"))
            .ticks(5);

        chart.append("g")
            .attr("transform", "translate(0," + chartHeight + ")")
            .call(xAxis)
            .selectAll("text")
            .attr("fill", "#111111")
            .attr("font-size", "11px");

        // y axis
        const yAxis = d3.axisLeft(yScale);

        chart.append("g")
            .call(yAxis)
            .selectAll("text")
            .attr("fill", "#111111")
            .attr("font-size", "11px");

        // remove heavy axis lines
        chart.selectAll(".domain")
            .attr("stroke", "#111111");

        chart.selectAll(".tick line")
            .attr("stroke", "#aa3c2d")
            .attr("stroke-width", 0.5);

        // draw timeline bars
        chart.selectAll(".timeline-bar")
            .data(data)
            .enter()
            .append("rect")
            .attr("class", "timeline-bar")
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
            .attr("fill", function(d) {
                return colorScale(d.category);
            });

        // add start/end year labels
        chart.selectAll(".year-label")
            .data(data)
            .enter()
            .append("text")
            .attr("x", function(d) {
                return xScale(d.end) + 6;
            })
            .attr("y", function(d) {
                return yScale(d.name) + yScale.bandwidth() / 2 + 4;
            })
            .attr("fill", "#111111")
            .attr("font-size", "10px")
            .text(function(d) {
                return d.start + "–" + d.end;
            });

        // title inside SVG
        svg.append("text")
            .attr("x", 30)
            .attr("y", 28)
            .attr("fill", "#111111")
            .attr("font-size", "13px")
            .attr("font-weight", "bold")
            .text("Temporal Structure / Design Development Timeline");

    });

})();