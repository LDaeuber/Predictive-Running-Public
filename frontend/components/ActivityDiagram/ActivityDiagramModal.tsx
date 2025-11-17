"use client";

import React, { useEffect, useRef } from "react";
import * as d3 from "d3";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from "@heroui/react";

interface Run {
  id: string | number;
  distance: number;
  moving_time: number;
  average_pace: number;
}

interface ActivityDiagramModalProps {
  runs: Run[];
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

const ActivityDiagramModal: React.FC<ActivityDiagramModalProps> = ({
  runs,
  isOpen,
  onOpenChange,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    const container = containerRef.current;

    if (!isOpen || !svg || !container) {
      return;
    }

    if (!runs || runs.length === 0) {
      svg.selectAll("*").remove();
      return;
    }

    const drawChart = () => {
      if (!container) return;

      const width = container.clientWidth;
      const height = container.clientHeight;

      svg.selectAll("*").remove();

      const margin = {
        top: Math.max(height * 0.1, 80),
        right: Math.min(width * 0.05, 60),
        bottom: height * 0.2,
        left: Math.min(width * 0.1, 70),
      };

      const chartWidth = width - margin.left - margin.right;
      const chartHeight = height - margin.top - margin.bottom;

      const chart = svg
        .attr("width", width)
        .attr("height", height)
        .style("background-color", "#1a1a1a")
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

      const data = runs.map((run) => ({
        id: run.id,
        distance: run.distance / 1000,
        time: run.moving_time / 60,
        speed: run.average_pace,
      }));

      if (data.length === 0) {
        return;
      }

      const maxDist = d3.max(data, (d) => d.distance) ?? 0;
      const maxTime = d3.max(data, (d) => d.time) ?? 0;
      const [minSpeed, maxSpeed] = d3.extent(data, (d) => d.speed) as [
        number,
        number,
      ];

      const x = d3
        .scaleLinear()
        .domain([0, maxTime * 1.05])
        .range([0, chartWidth]);
      const y = d3
        .scaleLinear()
        .domain([0, maxDist * 1.05])
        .range([chartHeight, 0]);
      const z = d3.scaleSqrt().domain([minSpeed, maxSpeed]).range([25, 4]);

      const colorScale = d3
        .scaleLinear<string>()
        .domain([minSpeed, maxSpeed])
        .range(["#c4b5fd", "#4c1d95"])
        .interpolate(d3.interpolateHsl);

      const baseFont = Math.max(10, Math.min(14, width / 100));

      // X-Achse
      chart
        .append("g")
        .attr("transform", `translate(0, ${chartHeight})`)
        .call(d3.axisBottom(x))
        .selectAll("text")
        .style("fill", "#f9fafb")
        .style("font-size", `${baseFont}px`);

      chart
        .append("text")
        .attr("text-anchor", "middle")
        .attr("x", chartWidth / 2)
        .attr("y", chartHeight + margin.bottom / 2 + baseFont)
        .style("fill", "#f9fafb")
        .style("font-size", `${baseFont}px`)
        .text("Time (min)");

      // Y-Achse
      chart
        .append("g")
        .call(d3.axisLeft(y))
        .selectAll("text")
        .style("fill", "#f9fafb")
        .style("font-size", `${baseFont}px`);

      chart
        .append("text")
        .attr("text-anchor", "middle")
        .attr("transform", "rotate(-90)")
        .attr("x", -chartHeight / 2)
        .attr("y", -margin.left / 2 - baseFont)
        .style("fill", "#f9fafb")
        .style("font-size", `${baseFont}px`)
        .text("Distance (km)");

      chart
        .append("g")
        .attr("class", "grid")
        .call(
          d3
            .axisLeft(y)
            .ticks(5)
            .tickSize(-chartWidth)
            .tickFormat("" as any)
        )
        .selectAll("line")
        .attr("stroke", "#404040")
        .attr("stroke-opacity", 0.7);

      chart
        .append("g")
        .attr("class", "grid")
        .attr("transform", `translate(0, ${chartHeight})`)
        .call(
          d3
            .axisBottom(x)
            .ticks(5)
            .tickSize(-chartHeight)
            .tickFormat("" as any)
        )
        .selectAll("line")
        .attr("stroke", "#404040")
        .attr("stroke-opacity", 0.7);

      // Bubbles
      chart
        .append("g")
        .selectAll("circle")
        .data(data)
        .enter()
        .append("circle")
        .attr("cx", (d) => x(d.time))
        .attr("cy", (d) => y(d.distance))
        .attr("r", (d) => z(d.speed))
        .style("fill", (d) => colorScale(d.speed))
        .style("opacity", 0.7)
        .attr("stroke", "#f9fafb")
        .style("stroke-width", 1);
    };

    drawChart();
    const resizeObserver = new ResizeObserver(() => drawChart());

    if (container) {
      resizeObserver.observe(container);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, [runs, isOpen]);

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      scrollBehavior="inside"
      classNames={{
        backdrop: "z-[9998]",
        wrapper: "z-[9999]",
        base: "w-[80vw] max-w-[80vw] h-[80vh] max-h-[80vh]",
      }}
      hideCloseButton
      isDismissable={false}
    >
      <ModalContent className="bg-neutral-900 text-neutral-200">
        {(onClose) => (
          <>
            <ModalHeader className="flex items-center justify-between border-b border-[#9B5DE0] pb-3">
              <div className="text-xl text-[#9B5DE0]">Activity Diagram</div>

              <div className="flex flex-col items-end">
                {/* Kreise horizontal */}
                <div className="flex items-center gap-2 relative">
                  {(() => {
                    const steps = 5;
                    if (runs.length === 0) return null;

                    const [minSpeed, maxSpeed] = d3.extent(
                      runs,
                      (d) => d.average_pace
                    ) as [number, number];
                    const z = d3
                      .scaleSqrt()
                      .domain([minSpeed, maxSpeed])
                      .range([25, 4]);
                    const colorScale = d3
                      .scaleLinear<string>()
                      .domain([minSpeed, maxSpeed])
                      .range(["#c4b5fd", "#4c1d95"])
                      .interpolate(d3.interpolateHsl);

                    return Array.from({ length: steps }, (_, i) => {
                      const t = i / (steps - 1);
                      const speed = minSpeed + t * (maxSpeed - minSpeed);
                      return (
                        <div
                          key={i}
                          style={{
                            width: z(speed) * 2,
                            height: z(speed) * 2,
                            borderRadius: "50%",
                            backgroundColor: colorScale(speed),
                            border: "1px solid #f9fafb",
                          }}
                        />
                      );
                    });
                  })()}
                </div>

                {/* Beschriftungen und Pfeil */}
                <div className="flex items-center mt-1 w-full text-xs text-neutral-200 relative">
                  {/* Slow zentriert unter größtem Kreis */}
                  <span
                    className="absolute"
                    style={{
                      left: (() => {
                        const steps = 5;
                        if (runs.length === 0) return 0;
                        const [minSpeed, maxSpeed] = d3.extent(
                          runs,
                          (d) => d.average_pace
                        ) as [number, number];
                        const z = d3
                          .scaleSqrt()
                          .domain([minSpeed, maxSpeed])
                          .range([25, 4]);
                        const firstRadius = z(minSpeed);
                        return `${firstRadius}px`;
                      })(),
                      transform: "translateX(-50%)",
                    }}
                  >
                    Slow
                  </span>

                  {/* Pfeil zentriert zwischen den Kreisen */}
                  <span className="flex-1 text-center">→</span>

                  {/* Fast rechtsbündig mit kleinstem Kreis */}
                  <span
                    className="absolute"
                    style={{
                      right: 0,
                    }}
                  >
                    Fast
                  </span>
                </div>
              </div>
            </ModalHeader>

            <ModalBody>
              <div
                ref={containerRef}
                style={{
                  width: "100%",
                  height: "100%",
                  borderRadius: "8px",
                  overflow: "hidden",
                  backgroundColor: "#1a1a1a",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                {runs.length === 0 ? (
                  <div className="text-emerald-500">No runs available</div>
                ) : (
                  <svg ref={svgRef} style={{ width: "100%", height: "100%" }} />
                )}
              </div>
            </ModalBody>

            <ModalFooter className="border-t border-neutral-700">
              <Button color="default" onPress={onClose}>
                Close
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default ActivityDiagramModal;
