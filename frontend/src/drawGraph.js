// Some code in this file was generated using AI

import * as d3 from "d3";

export function drawGraph(svgElement, data, width, height) {
  // D3 force simulation mutates node and link objects, so create shallow copies
  const nodes = data.nodes.map((d) => ({ ...d }));
  const links = data.links.map((d) => ({ ...d }));

  const svg = d3.select(svgElement);
  svg.selectAll("*").remove(); // Clear prior renders

  svg
    .attr("viewBox", [0, 0, width, height])
    .attr("width", "100%")
    .attr("height", height)
    .style("max-width", "100%")
    .style("height", "auto");

  // Task 6.4: Single container <g> for all graph elements
  const container = svg.append("g").attr("class", "network-container");

  // Task 6.4: Attach zoom/pan to <svg>, transforming the container <g>
  const zoom = d3
    .zoom()
    .scaleExtent([0.05, 5])
    .on("zoom", (event) => {
      container.attr("transform", event.transform);
    });

  svg.call(zoom);

  // Task 6.3: Scale link width by value
  const linkWidthScale = d3
    .scaleLinear()
    .domain(d3.extent(links, (d) => d.value ?? 1))
    .range([1, 5]);

  // Task 6.3: Simulation setup with forces
  const simulation = d3
    .forceSimulation(nodes)
    .force(
      "link",
      d3
        .forceLink(links)
        .id((d) => d.id)
        .distance(35)
    )
    .force("charge", d3.forceManyBody().strength(-40)) // Kept moderate to control repulsive drift
    .force("center", d3.forceCenter(width / 2, height / 2))
    .force("x", d3.forceX(width / 2).strength(0.04))
    .force("y", d3.forceY(height / 2).strength(0.04));

  // Draw links inside container <g>
  const link = container
    .append("g")
    .attr("class", "links")
    .attr("stroke", "#999")
    .attr("stroke-opacity", 0.5)
    .selectAll("line")
    .data(links)
    .join("line")
    .attr("stroke-width", (d) => linkWidthScale(d.value ?? 1));

  // Task 6.5: Draw nodes with FSU red fill (#782F40) inside container
  const node = container
    .append("g")
    .attr("class", "nodes")
    .attr("stroke", "#ffffff")
    .attr("stroke-width", 1)
    .selectAll("circle")
    .data(nodes)
    .join("circle")
    .attr("r", 5)
    .attr("fill", "#782F40")
    .style("cursor", "grab");

  node.append("title").text((d) => `Paper ID: ${d.id}`);

  // Task 6.4: Drag interaction for individual nodes
  const drag = d3
    .drag()
    .on("start", (event) => {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
    })
    .on("drag", (event) => {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    })
    .on("end", (event) => {
      if (!event.active) simulation.alphaTarget(0);
      event.subject.fx = null;
      event.subject.fy = null;
    });

  node.call(drag);

  // Tick update
  simulation.on("tick", () => {
    link
      .attr("x1", (d) => d.source.x)
      .attr("y1", (d) => d.source.y)
      .attr("x2", (d) => d.target.x)
      .attr("y2", (d) => d.target.y);

    node.attr("cx", (d) => d.x).attr("cy", (d) => d.y);
  });

  // Task 6.3: Zoom-to-fit once the simulation stabilizes
  simulation.on("end", () => {
    if (!nodes.length) return;

    const xExtent = d3.extent(nodes, (d) => d.x);
    const yExtent = d3.extent(nodes, (d) => d.y);

    const graphWidth = xExtent[1] - xExtent[0];
    const graphHeight = yExtent[1] - yExtent[0];

    if (!graphWidth || !graphHeight) return;

    const padding = 40;
    const scale = Math.min(
      (width - padding * 2) / graphWidth,
      (height - padding * 2) / graphHeight,
      1 // Cap at 1 to prevent huge zooming on single components
    );

    const midX = (xExtent[0] + xExtent[1]) / 2;
    const midY = (yExtent[0] + yExtent[1]) / 2;

    const transform = d3.zoomIdentity
      .translate(width / 2, height / 2)
      .scale(scale)
      .translate(-midX, -midY);

    svg.transition().duration(750).call(zoom.transform, transform);
  });

  return () => simulation.stop();
}
