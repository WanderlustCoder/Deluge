"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

interface DayData {
  label: string;
  value: number;
}

export function RevenueChart() {
  const [data, setData] = useState<DayData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/analytics?days=30")
      .then((r) => r.json())
      .then((json) => {
        setData(json.adViewsByDay || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const maxValue = Math.max(...data.map((d) => d.value), 1);

  return (
    <Card>
      <CardHeader>
        <h2 className="font-heading font-semibold text-lg text-storm">
          Ad Views — Last 30 Days
        </h2>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-48 flex items-center justify-center text-storm-light text-sm">
            Loading chart...
          </div>
        ) : data.length === 0 ? (
          <div className="h-48 flex items-center justify-center text-storm-light text-sm">
            No ad view data available.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <div className="flex items-end gap-1 h-48 min-w-[600px]">
              {data.map((day, i) => {
                const height = maxValue > 0 ? (day.value / maxValue) * 100 : 0;
                return (
                  <div
                    key={i}
                    className="flex-1 flex flex-col items-center justify-end group"
                  >
                    {/* Tooltip */}
                    <span className="text-xs text-storm-light opacity-0 group-hover:opacity-100 transition-opacity mb-1 whitespace-nowrap">
                      {day.value}
                    </span>
                    {/* Bar */}
                    <div
                      className="w-full rounded-t bg-ocean/80 hover:bg-ocean transition-colors min-h-[2px]"
                      style={{ height: `${Math.max(height, 1)}%` }}
                    />
                  </div>
                );
              })}
            </div>
            {/* X-axis labels — show every 5th */}
            <div className="flex gap-1 mt-2 min-w-[600px]">
              {data.map((day, i) => (
                <div key={i} className="flex-1 text-center">
                  {i % 5 === 0 ? (
                    <span className="text-[10px] text-storm-light">{day.label}</span>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
