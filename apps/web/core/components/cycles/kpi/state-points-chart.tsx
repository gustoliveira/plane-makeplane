import React from "react";
// plane imports
import { BarChart } from "@plane/propel/charts/bar-chart";
import type { TChartData } from "@plane/types";
// components
import type { TCycleKpiStatePointsItem } from "@/components/cycles/kpi/filter-utils";

type TStatePointsChartDatum = TChartData<"name", "points"> & {
  key: string;
  color: string;
  unestimatedIssueCount: number;
  issues: TCycleKpiStatePointsItem["issues"];
};

type Props = {
  data: TCycleKpiStatePointsItem[];
  className?: string;
};

const TiltedXAxisTick = React.memo<{
  x?: number;
  y?: number;
  payload?: { value: string };
}>(({ x = 0, y = 0, payload }) => {
  if (!payload?.value) return null;
  return (
    <g transform={`translate(${x},${y})`}>
      <text transform="rotate(-35)" textAnchor="end" dy={14} dx={-4} className="fill-custom-text-300 text-xs">
        {payload.value}
      </text>
    </g>
  );
});
TiltedXAxisTick.displayName = "TiltedXAxisTick";

export const KpiStatePointsChart: React.FC<Props> = ({ data, className = "" }) => {
  const chartData = data.map((item) => ({
    key: item.key,
    name: item.name,
    points: item.points,
    color: item.color,
    unestimatedIssueCount: item.unestimatedIssueCount,
    issues: item.issues,
  })) as TStatePointsChartDatum[];

  return (
    <div className={`flex w-full items-center justify-center ${className}`}>
      <BarChart
        className="h-[350px] w-full"
        data={chartData as unknown as TChartData<"name", "points">[]}
        bars={[
          {
            key: "points",
            label: "Estimate points",
            stackId: "bar-one",
            fill: (payload) => payload.color ?? "#3F76FF",
            textClassName: "",
            showPercentage: false,
            showTopBorderRadius: () => true,
            showBottomBorderRadius: () => true,
          },
        ]}
        margin={{ bottom: 80 }}
        xAxis={
          { key: "name", dy: 16, interval: 0, minTickGap: 0, ticks: chartData.map((d) => d.name) } as unknown as {
            key: "name";
            dy: number;
          }
        }
        yAxis={{ key: "points", label: "Estimate points", offset: -58, dx: -24, allowDecimals: true }}
        customTicks={{ x: TiltedXAxisTick as React.ComponentType<unknown> }}
        customTooltipContent={({ active, payload }) => {
          const chartItem = Array.isArray(payload)
            ? (payload?.[0]?.payload as TStatePointsChartDatum | undefined)
            : undefined;

          if (!active || !chartItem) return null;

          const visibleIssues = chartItem.issues.slice(0, 8);
          const remainingIssuesCount = chartItem.issues.length - visibleIssues.length;

          return (
            <div className="max-h-[40vh] w-[18rem] space-y-2 overflow-y-auto rounded-md border border-custom-border-200 bg-custom-background-100 p-3 shadow-custom-shadow-4">
              <p className="border-b border-custom-border-200 pb-2 text-xs font-medium text-custom-text-100">
                {chartItem.name}
              </p>
              <p className="text-xs text-custom-text-300">
                Estimate points: <span className="font-medium text-custom-text-100">{chartItem.points}</span>
              </p>
              <p className="text-xs text-custom-text-300">
                Unestimated issues:{" "}
                <span className="font-medium text-custom-text-100">{chartItem.unestimatedIssueCount}</span>
              </p>
              <p className="text-xs text-custom-text-300">Issues ({chartItem.issues.length})</p>

              <div className="space-y-1">
                {visibleIssues.map((issue) => (
                  <p key={issue.id} className="truncate text-xs text-custom-text-100" title={issue.name}>
                    #{issue.sequenceId} {issue.name}
                  </p>
                ))}
                {remainingIssuesCount > 0 && (
                  <p className="text-xs text-custom-text-300">+{remainingIssuesCount} more issues</p>
                )}
              </div>
            </div>
          );
        }}
      />
    </div>
  );
};
