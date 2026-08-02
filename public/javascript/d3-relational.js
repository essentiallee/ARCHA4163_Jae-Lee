// Digital Object: Gallery Route Network
// D3 Relational Structure
// Nodes = galleries, neighborhoods, route anchors
// Edges = same area, walkable connection, route sequence

(function() {

    var nodePath = "data/gallery-nodes.csv";
    var edgePath = "data/gallery-edges.csv";

    Promise.all([
        d3.csv(nodePath),
        d3.csv(edgePath)
    ]).then(function(files) {

        var rawNodes = files[0];
        var rawLinks = files[1];

        rawLinks.forEach(function(d) {
            d.weight = +d.weight;
        });

        drawNetwork(rawNodes, rawLinks);

        window.addEventListener("resize", function() {
            drawNetwork(rawNodes, rawLinks);
        });
    });

    function drawNetwork(rawNodes, rawLinks) {

        var container = d3.select("#d3-relational-container");

        // Clear old drawing before redrawing
        container.selectAll("*").remove();

        var width = document.getElementById("d3-relational-container").clientWidth;
        var height = document.getElementById("d3-relational-container").clientHeight;

        if (width === 0) {
            width = 1000;
        }

        if (height === 0) {
            height = 560;
        }

        // Make fresh copies of the data.
        // This matters because d3.forceLink modifies the link data.
        var nodes = rawNodes.map(function(d) {
            return Object.assign({}, d);
        });

        var links = rawLinks.map(function(d) {
            return Object.assign({}, d);
        });

        var svg = container
            .append("svg")
            .attr("width", width)
            .attr("height", height)
            .style("cursor", "grab");

        // Background
        svg.append("rect")
            .attr("width", width)
            .attr("height", height)
            .attr("fill", "#f2f0e9");

        // Title
        svg.append("text")
            .attr("x", 40)
            .attr("y", 38)
            .attr("fill", "#111111")
            .attr("font-size", "18px")
            .attr("font-weight", "bold")
            .text("Gallery Route Network / Relational Structure");

        svg.append("text")
            .attr("x", 40)
            .attr("y", 62)
            .attr("fill", "#111111")
            .attr("font-size", "12px")
            .text("nodes = galleries / neighborhoods / route anchors     edges = walkable links / route sequence");

        // A group for the zoomable graph
        var graphGroup = svg.append("g")
            .attr("class", "graph-group");

        // Zoom and pan interaction
        var zoom = d3.zoom()
            .scaleExtent([0.5, 3])
            .on("zoom", function(event) {
                graphGroup.attr("transform", event.transform);
            });

        svg.call(zoom);

        // Arrow marker for route sequence edges
        svg.append("defs")
            .append("marker")
            .attr("id", "arrow-red")
            .attr("viewBox", "0 -5 10 10")
            .attr("refX", 22)
            .attr("refY", 0)
            .attr("markerWidth", 5)
            .attr("markerHeight", 5)
            .attr("orient", "auto")
            .append("path")
            .attr("d", "M0,-5L10,0L0,5")
            .attr("fill", "#aa3c2d");

        // Tooltip, created directly in JS so no CSS change is needed
        var tooltip = d3.select("body")
            .append("div")
            .style("position", "absolute")
            .style("background", "#111111")
            .style("color", "#f2f0e9")
            .style("padding", "8px 10px")
            .style("font-family", "Barlow Condensed, Arial, sans-serif")
            .style("font-size", "14px")
            .style("line-height", "1.2")
            .style("border", "1px solid #aa3c2d")
            .style("pointer-events", "none")
            .style("opacity", 0);

        function nodeRadius(d) {
            if (d.type === "area") {
                return 26;
            }

            if (d.type === "anchor") {
                return 13;
            }

            return 9;
        }

        function nodeFill(d) {
            if (d.type === "area") {
                return "#f2f0e9";
            }

            if (d.type === "anchor") {
                return "#aa3c2d";
            }

            return "#111111";
        }

        function nodeStroke(d) {
            if (d.priority === "must") {
                return "#aa3c2d";
            }

            return "#111111";
        }

        function linkColor(d) {
            if (d.relation === "route_sequence") {
                return "#aa3c2d";
            }

            if (d.relation === "walkable") {
                return "#111111";
            }

            return "#c8c3b8";
        }

        function linkOpacity(d) {
            if (d.relation === "route_sequence") {
                return 1;
            }

            if (d.relation === "walkable") {
                return 0.45;
            }

            return 0.6;
        }

        function linkWidth(d) {
            if (d.relation === "route_sequence") {
                return 2.2;
            }

            if (d.relation === "walkable") {
                return 1.2;
            }

            return 0.8;
        }

        function linkDistance(d) {
            if (d.relation === "same_area") {
                return 80;
            }

            if (d.relation === "walkable") {
                return 110;
            }

            return 140;
        }

        function linkStrength(d) {
            if (d.relation === "same_area") {
                return 0.6;
            }

            if (d.relation === "walkable") {
                return 0.35;
            }

            return 0.45;
        }

        function targetX(d) {
            if (d.area === "chelsea") {
                return width * 0.28;
            }

            if (d.area === "soho") {
                return width * 0.55;
            }

            if (d.area === "chinatown") {
                return width * 0.78;
            }

            return width / 2;
        }

        function targetY(d) {
            if (d.type === "area") {
                return height * 0.32;
            }

            if (d.type === "anchor") {
                return height * 0.62;
            }

            return height * 0.52;
        }

        // Draw links first so they sit behind the nodes
        var link = graphGroup
            .selectAll(".link")
            .data(links)
            .enter()
            .append("line")
            .attr("class", "link")
            .attr("stroke", function(d) {
                return linkColor(d);
            })
            .attr("stroke-width", function(d) {
                return linkWidth(d);
            })
            .attr("opacity", function(d) {
                return linkOpacity(d);
            })
            .attr("marker-end", function(d) {
                if (d.relation === "route_sequence") {
                    return "url(#arrow-red)";
                }

                return null;
            });

        // Draw node groups
        var node = graphGroup
            .selectAll(".node")
            .data(nodes)
            .enter()
            .append("g")
            .attr("class", "node")
            .style("cursor", "pointer")
            .call(
                d3.drag()
                    .on("start", dragStarted)
                    .on("drag", dragged)
                    .on("end", dragEnded)
            );

        node.append("circle")
            .attr("r", function(d) {
                return nodeRadius(d);
            })
            .attr("fill", function(d) {
                return nodeFill(d);
            })
            .attr("stroke", function(d) {
                return nodeStroke(d);
            })
            .attr("stroke-width", function(d) {
                if (d.type === "area") {
                    return 1.5;
                }

                if (d.priority === "must") {
                    return 2.5;
                }

                return 1;
            });

        // Labels
        node.append("text")
            .attr("x", function(d) {
                return nodeRadius(d) + 7;
            })
            .attr("y", 4)
            .attr("fill", "#111111")
            .attr("font-size", function(d) {
                if (d.type === "area") {
                    return "16px";
                }

                return "11px";
            })
            .attr("font-weight", function(d) {
                if (d.type === "area" || d.type === "anchor") {
                    return "bold";
                }

                return "normal";
            })
            .text(function(d) {
                return d.label;
            });

        // Tooltip behavior
        node.on("mouseover", function(event, d) {
                tooltip
                    .style("opacity", 1)
                    .html(
                        "<strong>" + d.label + "</strong><br>" +
                        "type: " + d.type + "<br>" +
                        "area: " + d.area + "<br>" +
                        "priority: " + d.priority + "<br>" +
                        d.description
                    );
            })
            .on("mousemove", function(event) {
                tooltip
                    .style("left", event.pageX + 14 + "px")
                    .style("top", event.pageY + 14 + "px");
            })
            .on("mouseout", function() {
                tooltip.style("opacity", 0);
            });

        // Force simulation
        var simulation = d3.forceSimulation(nodes)
            .force("link", d3.forceLink(links)
                .id(function(d) {
                    return d.id;
                })
                .distance(function(d) {
                    return linkDistance(d);
                })
                .strength(function(d) {
                    return linkStrength(d);
                })
            )
            .force("charge", d3.forceManyBody().strength(-280))
            .force("center", d3.forceCenter(width / 2, height / 2 + 25))
            .force("x", d3.forceX(function(d) {
                return targetX(d);
            }).strength(0.08))
            .force("y", d3.forceY(function(d) {
                return targetY(d);
            }).strength(0.08))
            .force("collision", d3.forceCollide(function(d) {
                return nodeRadius(d) + 10;
            }));

        simulation.on("tick", function() {

            link
                .attr("x1", function(d) {
                    return d.source.x;
                })
                .attr("y1", function(d) {
                    return d.source.y;
                })
                .attr("x2", function(d) {
                    return d.target.x;
                })
                .attr("y2", function(d) {
                    return d.target.y;
                });

            node.attr("transform", function(d) {
                return "translate(" + d.x + "," + d.y + ")";
            });
        });

        function dragStarted(event, d) {
            if (!event.active) {
                simulation.alphaTarget(0.3).restart();
            }

            d.fx = d.x;
            d.fy = d.y;
        }

        function dragged(event, d) {
            d.fx = event.x;
            d.fy = event.y;
        }

        function dragEnded(event, d) {
            if (!event.active) {
                simulation.alphaTarget(0);
            }

            d.fx = null;
            d.fy = null;
        }

        // Legend
        svg.append("text")
            .attr("x", 40)
            .attr("y", height - 34)
            .attr("fill", "#111111")
            .attr("font-size", "12px")
            .text("red edge = suggested route     black edge = walkable connection     pale edge = same neighborhood");

    }

})();