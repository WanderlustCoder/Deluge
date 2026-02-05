"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardHeader, CardContent } from "@/components/ui/card";

interface ActivityChartProps {
  data: { date: string; ads: number; funded: number }[];
}

function getDayLabel(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("en-US", { weekday: "short" }).slice(0, 2);
}

function getDateLabel(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function ActivityChart({ data }: ActivityChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const maxAds = Math.max(...data.map((d) => d.ads), 1);
  const maxFunded = Math.max(...data.map((d) => d.funded), 0.01);

  const chartHeight = 160;
  const barWidth = 14;
  const gap = 4;
  const groupWidth = barWidth * 2 + gap;
  const chartWidth = data.length * (groupWidth + 8);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <h3 className="font-heading font-semibold text-storm">
            14-Day Activity
          </h3>
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-sky inline-block" />
              Ads Watched
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-teal inline-block" />
              Funded ($)
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <svg
            width={Math.max(chartWidth + 20, 400)}
            height={chartHeight + 40}
            className="w-full"
            viewBox={`0 0 ${Math.max(chartWidth + 20, 400)} ${chartHeight + 40}`}
            preserveAspectRatio="xMidYMid meet"
          >
            {/* Grid lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((pct) => (
              <line
                key={pct}
                x1={10}
                y1={chartHeight * (1 - pct)}
                x2={Math.max(chartWidth + 10, 390)}
                y2={chartHeight * (1 - pct)}
                stroke="#E5E7EB"
                strokeWidth={1}
                strokeDasharray={pct === 0 ? "0" : "4 4"}
              />
            ))}

            {data.map((day, i) => {
              const x = 10 + i * (groupWidth + 8);
              const adsHeight =
                maxAds > 0 ? (day.ads / maxAds) * chartHeight : 0;
              const fundedHeight =
                maxFunded > 0
                  ? (day.funded / maxFunded) * chartHeight
                  : 0;

              return (
                <g
                  key={day.date}
                  onMouseEnter={() => setHoveredIndex(i)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  className="cursor-pointer"
                >
                  {/* Hover background */}
                  {hoveredIndex === i && (
                    <rect
                      x={x - 4}
                      y={0}
                      width={groupWidth + 8}
                      height={chartHeight}
                      fill="#F3F4F6"
                      rx={4}
                    />
                  )}

                  {/* Ads bar (blue) */}
                  <motion.rect
                    x={x}
                    y={chartHeight - adsHeight}
                    width={barWidth}
                    height={adsHeight}
                    fill="#42A5F5"
                    rx={3}
                    initial={{ height: 0, y: chartHeight }}
                    animate={{
                      height: adsHeight,
                      y: chartHeight - adsHeight,
                    }}
                    transition={{ duration: 0.6, delay: i * 0.04 }}
                  />

                  {/* Funded bar (teal) */}
                  <motion.rect
                    x={x + barWidth + gap}
                    y={chartHeight - fundedHeight}
                    width={barWidth}
                    height={fundedHeight}
                    fill="#00897B"
                    rx={3}
                    initial={{ height: 0, y: chartHeight }}
                    animate={{
                      height: fundedHeight,
                      y: chartHeight - fundedHeight,
                    }}
                    transition={{ duration: 0.6, delay: i * 0.04 + 0.1 }}
                  />

                  {/* Day label */}
                  <text
                    x={x + groupWidth / 2}
                    y={chartHeight + 16}
                    textAnchor="middle"
                    className="text-[10px] fill-storm-light"
                  >
                    {getDayLabel(day.date)}
                  </text>

                  {/* Tooltip */}
                  {hoveredIndex === i && (
                    <g>
                      <rect
                        x={x - 20}
                        y={-8}
                        width={110}
                        height={52}
                        fill="white"
                        stroke="#E5E7EB"
                        strokeWidth={1}
                        rx={6}
                        filter="drop-shadow(0 2px 4px rgba(0,0,0,0.1))"
                      />
                      <text
                        x={x + 35}
                        y={10}
                        textAnchor="middle"
                        className="text-[10px] fill-storm font-semibold"
                      >
                        {getDateLabel(day.date)}
                      </text>
                      <text
                        x={x + 35}
                        y={24}
                        textAnchor="middle"
                        className="text-[10px] fill-sky"
                      >
                        {day.ads} ads
                      </text>
                      <text
                        x={x + 35}
                        y={38}
                        textAnchor="middle"
                        className="text-[10px] fill-teal"
                      >
                        ${day.funded.toFixed(2)} funded
                      </text>
                    </g>
                  )}
                </g>
              );
            })}
          </svg>
        </div>
      </CardContent>
    </Card>
  );
}
