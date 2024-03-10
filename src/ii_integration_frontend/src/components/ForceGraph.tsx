import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

interface Node {
  id: string;
  group: string;
}

interface Link {
  source: string;
  target: string;
  value: number;
}

export interface ChartProps {
  data: {
    nodes: Node[];
    links: Link[];
  };
  width: number;
  height: number;
}

const Chart: React.FC<ChartProps> = ({ data, width, height }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    // Delete the previous graph
    if (svgRef.current) {
      d3.select(svgRef.current).selectAll("*").remove();
    }

    const color = d3.scaleOrdinal(d3.schemeCategory10);
    const links = data.links.map((d) => ({ ...d }));
    const nodes = data.nodes.map((d) => ({ ...d }));

    const simulation = d3
      .forceSimulation(nodes as d3.SimulationNodeDatum[])
      .force(
        "link",
        d3.forceLink(links).id((d) => (d as Node).id)
      )
      .force("charge", d3.forceManyBody())
      .force("center", d3.forceCenter(width / 2, height / 2))
      .on("tick", ticked);

    const svg = d3
      .select(svgRef.current)
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", [0, 0, width, height].join(" "))
      .style("max-width", "100%")
      .style("height", "auto")
      .style("background-color", "black");

    const link = svg
      .append("g")
      .attr("stroke", "#999")
      .attr("stroke-opacity", 0.6)
      .selectAll("line")
      .data(links)
      .join("line")
      .attr("stroke-width", (d) => Math.sqrt((d as Link).value));

    const node = svg
      .append("g")
      .attr("stroke", "#fff")
      .attr("stroke-width", 1.5)
      .selectAll("circle")
      .data(nodes)
      .join("circle")
      .attr("r", 5)
      .attr("fill", (d) => color((d as Node).group.toString()));

    node.append("title").text((d) => (d as Node).id);

    node.call(
      //@ts-ignore
      d3
        .drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended)
    );

    function ticked() {
      link
        .attr("x1", (d) => (d.source as any).x)
        .attr("y1", (d) => (d.source as any).y)
        .attr("x2", (d) => (d.target as any).x)
        .attr("y2", (d) => (d.target as any).y);

      node.attr("cx", (d) => (d as any).x).attr("cy", (d) => (d as any).y);
    }

    function dragstarted(event: any) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      (event.subject as any).fx = event.subject.x;
      (event.subject as any).fy = event.subject.y;
    }

    function dragged(event: any) {
      (event.subject as any).fx = event.x;
      (event.subject as any).fy = event.y;
    }

    function dragended(event: any) {
      if (!event.active) simulation.alphaTarget(0);
      (event.subject as any).fx = null;
      (event.subject as any).fy = null;
    }

    return () => {
      simulation.stop();
    };
  }, [data]);

  return <svg ref={svgRef}></svg>;
};

export default Chart;
