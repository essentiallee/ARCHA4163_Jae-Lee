// Digital Object: NY Gallery Shows Timeline
// Interactive D3 timeline.
// The red planning line follows the mouse.
// Show colors update based on the planning date.

(function() {

    var csvPath = "data/ny-gallery-shows-timeline.csv";
    var selectedGalleryNames = new Set();
    var refreshTimelineSelection = null;

    function normalizeGalleryName(value) {
        return String(value || "")
            .trim()
            .toLowerCase()
            .replace(/\s+/g, " ");
    }

    window.addEventListener(
        "gallery:selection-changed",
        function(event) {
            var galleryNames =
                event.detail && event.detail.galleryNames
                    ? event.detail.galleryNames
                    : [];

            selectedGalleryNames = new Set(
                galleryNames.map(normalizeGalleryName)
            );

            if (refreshTimelineSelection) {
                refreshTimelineSelection();
            }
        }
    );

    function recordAndFocusGallery(d) {
        window.dispatchEvent(
            new CustomEvent(
                "gallery:selection-changed",
                {
                    detail: {
                        galleryNames: [d.gallery]
                    }
                }
            )
        );

        window.dispatchEvent(
            new CustomEvent("gallery:clicked", {
                detail: {
                    source: "timeline",
                    galleryName: d.gallery,
                    showName: d.show,
                    area: d.area
                }
            })
        );

        window.dispatchEvent(
            new CustomEvent("gallery:focus", {
                detail: {
                    gallery: d.gallery,
                    show: d.show
                }
            })
        );
    }

    d3.csv(csvPath).then(function(data) {

        var parseDate = d3.timeParse("%Y-%m-%d");

        data.forEach(function(d) {
            d.start = parseDate(d.start);
            d.end = parseDate(d.end);
        });

        data = data.filter(function(d) {
            return d.start !== null && d.end !== null;
        });

        data.sort(function(a, b) {
            return a.end - b.end;
        });

        drawTimeline(data);

        window.addEventListener("resize", function() {
            drawTimeline(data);
        });
    });

    function drawTimeline(data) {

        var container = d3.select("#d3-container-1");

        // clear old SVG before redrawing
        container.selectAll("*").remove();

        var width = document.getElementById("d3-container-1").clientWidth;
        var height = document.getElementById("d3-container-1").clientHeight;

        if (width === 0) {
            width = 1000;
        }

        if (height === 0) {
            height = 560;
        }

        var svg = container
            .append("svg")
            .attr("width", width)
            .attr("height", height)
            .style("cursor", "ew-resize");

        // background
        svg.append("rect")
            .attr("width", width)
            .attr("height", height)
            .attr("fill", "#f2f0e9");

        var margin = {
            top: 95,
            right: 80,
            bottom: 95,
            left: 130
        };

        var areas = ["chelsea", "soho", "chinatown", "upper east", "outside", "mixed"];

        // clean area groups
        data.forEach(function(d) {
            if (areas.indexOf(d.area_group) === -1) {
                d.area_group = "mixed";
            }
        });

        // x scale: time
        var xScale = d3.scaleTime()
            .domain([
                d3.min(data, function(d) { return d.start; }),
                d3.max(data, function(d) { return d.end; })
            ])
            .range([margin.left, width - margin.right]);

        // y scale: area rows
        var yScale = d3.scaleBand()
            .domain(areas)
            .range([margin.top, height - margin.bottom])
            .padding(0.45);

        // assign vertical offsets to reduce overlap
        var areaCount = {};

        data.forEach(function(d) {
            if (!areaCount[d.area_group]) {
                areaCount[d.area_group] = 0;
            }

            d.slot = areaCount[d.area_group] % 7;
            areaCount[d.area_group] += 1;
        });

        function yPosition(d) {
            var center = yScale(d.area_group) + yScale.bandwidth() / 2;
            var offset = (d.slot - 3) * 6;
            return center + offset;
        }

        // color changes according to the movable planning line
        function markColor(d, planningDate) {
            if (
                selectedGalleryNames.has(
                    normalizeGalleryName(d.gallery)
                )
            ) {
                return "#d7ff00";
            }

            if (planningDate < d.start) {
                return "#111111";     // upcoming
            }

            if (planningDate > d.end) {
                return "#9a9a9a";     // already closed
            }

            return "#aa3c2d";         // open during selected planning date
        }

        function markOpacity(d, planningDate) {
            if (
                selectedGalleryNames.has(
                    normalizeGalleryName(d.gallery)
                )
            ) {
                return 1;
            }

            if (planningDate > d.end) {
                return 0.35;
            }

            return 1;
        }

        function markWidth(d, planningDate) {
            if (
                selectedGalleryNames.has(
                    normalizeGalleryName(d.gallery)
                )
            ) {
                return 8;
            }

            if (planningDate >= d.start && planningDate <= d.end) {
                return 5;
            }

            return 3;
        }

        // title
        svg.append("text")
            .attr("x", 40)
            .attr("y", 38)
            .attr("fill", "#111111")
            .attr("font-size", "18px")
            .attr("font-weight", "bold")
            .text("NY Gallery Shows / Temporal Structure");

        // subtitle
        svg.append("text")
            .attr("x", 40)
            .attr("y", 62)
            .attr("fill", "#111111")
            .attr("font-size", "12px")
            .text(data.length + " dated shows from uploaded CSV");

        // active date label
        var activeDateText = svg.append("text")
            .attr("x", width - margin.right)
            .attr("y", 62)
            .attr("text-anchor", "end")
            .attr("fill", "#aa3c2d")
            .attr("font-size", "12px")
            .attr("font-weight", "bold");

        // area labels
        svg.selectAll(".area-label")
            .data(areas)
            .enter()
            .append("text")
            .attr("x", margin.left - 18)
            .attr("y", function(d) {
                return yScale(d) + yScale.bandwidth() / 2 + 4;
            })
            .attr("text-anchor", "end")
            .attr("fill", "#111111")
            .attr("font-size", "13px")
            .text(function(d) {
                return d;
            });

        // row guide lines
        svg.selectAll(".row-line")
            .data(areas)
            .enter()
            .append("line")
            .attr("x1", margin.left)
            .attr("x2", width - margin.right)
            .attr("y1", function(d) {
                return yScale(d) + yScale.bandwidth() / 2;
            })
            .attr("y2", function(d) {
                return yScale(d) + yScale.bandwidth() / 2;
            })
            .attr("stroke", "#d8d4ca")
            .attr("stroke-width", 1);

        // baseline
        var axisY = height - margin.bottom + 32;

        svg.append("line")
            .attr("x1", margin.left)
            .attr("x2", width - margin.right)
            .attr("y1", axisY)
            .attr("y2", axisY)
            .attr("stroke", "#aa3c2d")
            .attr("stroke-width", 1);

        // show marks
        var showMarks = svg.selectAll(".show-mark")
            .data(data)
            .enter()
            .append("line")
            .attr("class", "show-mark")
            .attr("x1", function(d) {
                if (d.date_type === "single") {
                    return xScale(d.end) - 5;
                }

                return xScale(d.start);
            })
            .attr("x2", function(d) {
                if (d.date_type === "single") {
                    return xScale(d.end) + 5;
                }

                return xScale(d.end);
            })
            .attr("y1", function(d) {
                return yPosition(d);
            })
            .attr("y2", function(d) {
                return yPosition(d);
            })
            .attr("stroke-linecap", "round")
            .style("pointer-events", "none");

        // hover tooltip
        showMarks.append("title")
            .text(function(d) {
                return d.show + "\n" +
                       d.gallery + "\n" +
                       d.area + "\n" +
                       d.date_text + "\n" +
                       d.priority;
            });

        // Wider invisible targets make short show bars easier to click.
        var showHitTargets = svg.selectAll(".show-hit-target")
            .data(data)
            .enter()
            .append("rect")
            .attr("class", "show-hit-target")
            .attr("x", function(d) {
                if (d.date_type === "single") {
                    return xScale(d.end) - 10;
                }

                return xScale(d.start) - 5;
            })
            .attr("width", function(d) {
                if (d.date_type === "single") {
                    return 20;
                }

                return Math.max(
                    20,
                    xScale(d.end) - xScale(d.start) + 10
                );
            })
            .attr("y", function(d) {
                return yPosition(d) - 9;
            })
            .attr("height", 18)
            .attr("rx", 9)
            .attr("fill", "transparent")
            .style("pointer-events", "all")
            .style("cursor", "pointer")
            .attr("tabindex", 0)
            .attr("role", "button")
            .attr("aria-pressed", function(d) {
                return selectedGalleryNames.has(
                    normalizeGalleryName(d.gallery)
                )
                    ? "true"
                    : "false";
            })
            .attr("aria-label", function(d) {
                return "Locate " + d.gallery + " on the map";
            })
            .on("click", function(event, d) {
                recordAndFocusGallery(d);
            })
            .on("keydown", function(event, d) {
                if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    recordAndFocusGallery(d);
                }
            });

        showHitTargets.append("title")
            .text(function(d) {
                return "Click to locate " + d.gallery + " on the map";
            });

        // x axis
        var xAxis = d3.axisBottom(xScale)
            .ticks(d3.timeMonth.every(1))
            .tickFormat(d3.timeFormat("%b"));

        svg.append("g")
            .attr("transform", "translate(0," + axisY + ")")
            .call(xAxis)
            .selectAll("text")
            .attr("fill", "#111111")
            .attr("font-size", "12px");

        svg.selectAll(".domain")
            .attr("stroke", "#111111");

        svg.selectAll(".tick line")
            .attr("stroke", "#aa3c2d")
            .attr("stroke-width", 0.5);

        // movable planning line group
        var markerGroup = svg.append("g")
            .attr("class", "planning-marker")
            .style("pointer-events", "none");

        markerGroup.append("line")
            .attr("y1", margin.top - 26)
            .attr("y2", axisY)
            .attr("stroke", "#aa3c2d")
            .attr("stroke-width", 1.5);

        markerGroup.append("circle")
            .attr("cy", axisY)
            .attr("r", 5)
            .attr("fill", "#aa3c2d");

        var markerLabel = markerGroup.append("text")
            .attr("x", 7)
            .attr("y", margin.top - 32)
            .attr("fill", "#aa3c2d")
            .attr("font-size", "11px")
            .text("planning line");

        // legend
        svg.append("text")
            .attr("x", margin.left)
            .attr("y", height - 30)
            .attr("fill", "#111111")
            .attr("font-size", "11px")
            .text("lime = selected gallery     black = upcoming     red = open     gray = closed");

        // Track the planning date across the plot without covering show targets.
        svg.on("mousemove.planning", function(event) {
            var mouse = d3.pointer(event);
            var mouseX = mouse[0];
            var mouseY = mouse[1];

            if (
                mouseX >= margin.left &&
                mouseX <= width - margin.right &&
                mouseY >= margin.top - 36 &&
                mouseY <= axisY
            ) {
                updatePlanningLine(mouseX);
            }
        });

        // initial planning line position
        var initialDate = d3.timeParse("%Y-%m-%d")("2026-07-12");
        var initialX = xScale(initialDate);

        var currentPlanningDate =
            xScale.invert(initialX);

        refreshTimelineSelection =
            function() {
                showMarks
                    .attr("stroke", function(d) {
                        return markColor(
                            d,
                            currentPlanningDate
                        );
                    })
                    .attr("stroke-width", function(d) {
                        return markWidth(
                            d,
                            currentPlanningDate
                        );
                    })
                    .attr("opacity", function(d) {
                        return markOpacity(
                            d,
                            currentPlanningDate
                        );
                    });

                showHitTargets
                    .attr("aria-pressed", function(d) {
                        return selectedGalleryNames.has(
                            normalizeGalleryName(
                                d.gallery
                            )
                        )
                            ? "true"
                            : "false";
                    });

                showMarks
                    .filter(function(d) {
                        return selectedGalleryNames.has(
                            normalizeGalleryName(
                                d.gallery
                            )
                        );
                    })
                    .raise();
            };

        updatePlanningLine(initialX);

        function updatePlanningLine(mouseX) {

            if (mouseX < margin.left) {
                mouseX = margin.left;
            }

            if (mouseX > width - margin.right) {
                mouseX = width - margin.right;
            }

            var planningDate = xScale.invert(mouseX);
            currentPlanningDate = planningDate;

            markerGroup.attr("transform", "translate(" + mouseX + ",0)");

            markerLabel.text(d3.timeFormat("%b %d")(planningDate));

            activeDateText.text("planning date: " + d3.timeFormat("%B %d, %Y")(planningDate));

            refreshTimelineSelection();
        }
    }

})();
