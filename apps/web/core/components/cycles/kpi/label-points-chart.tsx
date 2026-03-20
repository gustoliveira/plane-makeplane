import React from "react";
// plane imports
import { BarChart } from "@plane/propel/charts/bar-chart";
import type { TChartData } from "@plane/types";
// components
import type { TCycleKpiLabelPointsItem } from "@/components/cycles/kpi/filter-utils";

type TLabelPointsChartDatum = TChartData<"name", "points"> & {
  key: string;
  color: string;
  issues: TCycleKpiLabelPointsItem["issues"];
};

type Props = {
  data: TCycleKpiLabelPointsItem[];
  className?: string;
};

export const KpiLabelPointsChart: React.FC<Props> = ({ data, className = "" }) => {
  const chartData = data.map((item) => ({
    key: item.key,
    name: item.name,
    points: item.points,
    color: item.color,
    issues: item.issues,
  })) as TLabelPointsChartDatum[];

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
        margin={{ bottom: 30 }}
        xAxis={{ key: "name", label: "Labels", dy: 30 }}
        yAxis={{ key: "points", label: "Estimate points", offset: -58, dx: -24, allowDecimals: true }}
        customTooltipContent={({ active, payload }) => {
          const chartItem = Array.isArray(payload)
            ? (payload?.[0]?.payload as TLabelPointsChartDatum | undefined)
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
