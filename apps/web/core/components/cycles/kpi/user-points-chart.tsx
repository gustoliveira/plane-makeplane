import React from "react";
// plane imports
import { BarChart } from "@plane/propel/charts/bar-chart";
import type { TChartData } from "@plane/types";
// components
import type { TCycleKpiUserPointsItem, TCycleKpiUserStatusSeriesItem } from "@/components/cycles/kpi/filter-utils";

type TUserPointsChartDatum = TChartData<"name", string> & {
  key: string;
  issueCount: number;
  unestimatedIssueCount: number;
  estimatedPoints: number;
  issues: TCycleKpiUserPointsItem["issues"];
  stateIssueCounts: Record<string, number>;
};

type Props = {
  data: TCycleKpiUserPointsItem[];
  statusSeries: TCycleKpiUserStatusSeriesItem[];
  className?: string;
};

export const KpiUserPointsChart: React.FC<Props> = ({ data, statusSeries, className = "" }) => {
  const chartData = data.map((item) => {
    const stateCounts = statusSeries.reduce<Record<string, number>>((acc, seriesItem) => {
      acc[seriesItem.key] = item.stateIssueCounts[seriesItem.key] ?? 0;
      return acc;
    }, {});

    return {
      key: item.key,
      name: item.name,
      issueCount: item.issueCount,
      unestimatedIssueCount: item.unestimatedIssueCount,
      estimatedPoints: item.estimatedPoints,
      issues: item.issues,
      stateIssueCounts: item.stateIssueCounts,
      ...stateCounts,
    };
  }) as TUserPointsChartDatum[];
  const minChartWidth = Math.max(900, chartData.length * 120);

  return (
    <div className={`w-full overflow-x-auto pb-2 ${className}`}>
      <div style={{ minWidth: `${minChartWidth}px` }}>
        <BarChart
          className="h-[380px] w-full"
          data={chartData as unknown as TChartData<"name", string>[]}
          bars={statusSeries.map((seriesItem) => ({
            key: seriesItem.key,
            label: seriesItem.name,
            stackId: "user-status-stack",
            fill: seriesItem.color,
            textClassName: "",
            showPercentage: false,
            showTopBorderRadius: () => true,
            showBottomBorderRadius: () => true,
          }))}
          barSize={26}
          margin={{ bottom: 30 }}
          xAxis={{ key: "name", label: "Users", dy: 30 }}
          yAxis={{
            key: statusSeries[0]?.key ?? "issueCount",
            label: "Issue count",
            offset: -58,
            dx: -24,
            allowDecimals: false,
          }}
          legend={{ align: "center", verticalAlign: "bottom", layout: "horizontal" }}
          customTooltipContent={({ active, payload }) => {
            const chartItem = Array.isArray(payload)
              ? (payload?.[0]?.payload as TUserPointsChartDatum | undefined)
              : undefined;

            if (!active || !chartItem) return null;

            const visibleIssues = chartItem.issues.slice(0, 8);
            const remainingIssuesCount = chartItem.issues.length - visibleIssues.length;
            const statusCounts = statusSeries.filter(
              (seriesItem) => (chartItem.stateIssueCounts[seriesItem.key] ?? 0) > 0
            );

            return (
              <div className="max-h-[44vh] w-[19rem] space-y-2 overflow-y-auto rounded-md border border-custom-border-200 bg-custom-background-100 p-3 shadow-custom-shadow-4">
                <p className="border-b border-custom-border-200 pb-2 text-xs font-medium text-custom-text-100">
                  {chartItem.name}
                </p>
                <p className="text-xs text-custom-text-300">
                  Total issues: <span className="font-medium text-custom-text-100">{chartItem.issueCount}</span>
                </p>
                <p className="text-xs text-custom-text-300">
                  Estimated points:{" "}
                  <span className="font-medium text-custom-text-100">{chartItem.estimatedPoints}</span>
                </p>
                <p className="text-xs text-custom-text-300">
                  Unestimated issues:{" "}
                  <span className="font-medium text-custom-text-100">{chartItem.unestimatedIssueCount}</span>
                </p>

                {statusCounts.length > 0 && (
                  <div className="space-y-1">
                    <p className="text-xs text-custom-text-300">Status breakdown</p>
                    {statusCounts.map((seriesItem) => (
                      <p key={seriesItem.key} className="text-xs text-custom-text-100">
                        {seriesItem.name}: {chartItem.stateIssueCounts[seriesItem.key]}
                      </p>
                    ))}
                  </div>
                )}

                <div className="space-y-1">
                  <p className="text-xs text-custom-text-300">Issues ({chartItem.issues.length})</p>
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
    </div>
  );
};
