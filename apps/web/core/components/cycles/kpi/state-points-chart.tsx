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

const HiddenXAxisTick = React.memo(() => null);
HiddenXAxisTick.displayName = "HiddenXAxisTick";

export const KpiStatePointsChart: React.FC<Props> = ({ data, className = "" }) => {
  const chartData = data.map((item) => ({
    key: item.key,
    name: item.name,
    points: item.points,
    color: item.color,
    unestimatedIssueCount: item.unestimatedIssueCount,
    issues: item.issues,
  })) as TStatePointsChartDatum[];

  const minChartWidth = Math.max(760, chartData.length * 88);
  const xAxisTicks = chartData.map((item) => item.name);
  const chartXAxis = {
    key: "name",
    dy: 0,
    interval: 0,
    minTickGap: 0,
    ticks: xAxisTicks,
  } as unknown as { key: "name"; dy: number };

  return (
    <div className={`w-full ${className}`}>
      <div className="overflow-x-auto pb-2">
        <div style={{ minWidth: `${minChartWidth}px` }}>
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
            barSize={32}
            margin={{ bottom: 8 }}
            xAxis={chartXAxis}
            yAxis={{ key: "points", label: "Estimate points", offset: -58, dx: -24, allowDecimals: true }}
            customTicks={{
              x: HiddenXAxisTick as React.ComponentType<unknown>,
            }}
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

          <div className="px-[58px] pb-1 pt-3 h-[80px] overflow-hidden">
            <div
              className="grid gap-1"
              style={{ gridTemplateColumns: `repeat(${Math.max(chartData.length, 1)}, minmax(0, 1fr))` }}
            >
              {chartData.map((item) => (
                <div key={item.key} className="flex justify-center">
                  <span className="block origin-top-right -rotate-[35deg] whitespace-nowrap text-xs text-custom-text-300">
                    {item.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
