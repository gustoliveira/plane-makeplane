import React from "react";
// plane imports
import { AreaChart } from "@plane/propel/charts/area-chart";
import type { TChartData, TCycleCompletionChartDistribution, TModuleCompletionChartDistribution } from "@plane/types";
import { renderFormattedDateWithoutYear } from "@plane/utils";

type Props = {
  distribution: TModuleCompletionChartDistribution | TCycleCompletionChartDistribution;
  totalIssues: number;
  className?: string;
  plotTitle?: string;
  xAxisLabel?: string;
  yAxisLabel?: string;
  currentLabel?: string;
  idealLabel?: string;
};

const ProgressChart: React.FC<Props> = ({
  distribution,
  totalIssues,
  className = "",
  plotTitle = "work items",
  xAxisLabel = "Date",
  yAxisLabel = "Completion",
  currentLabel,
  idealLabel,
}) => {
  const distributionKeys = Object.keys(distribution ?? []);
  const stepCount = Math.max(distributionKeys.length - 1, 1);

  const chartData = distributionKeys.map((key, index) => ({
    name: renderFormattedDateWithoutYear(key),
    current: distribution[key],
    ideal: totalIssues * (1 - index / stepCount),
  })) as unknown as TChartData<string, string>[];

  return (
    <div className={`flex w-full items-center justify-center ${className}`}>
      <AreaChart
        data={chartData}
        areas={[
          {
            key: "current",
            label: currentLabel ?? `Current ${plotTitle}`,
            strokeColor: "#3F76FF",
            fill: "#3F76FF33",
            fillOpacity: 1,
            showDot: true,
            smoothCurves: true,
            strokeOpacity: 1,
            stackId: "bar-one",
          },
          {
            key: "ideal",
            label: idealLabel ?? `Ideal ${plotTitle}`,
            strokeColor: "#A9BBD0",
            fill: "#A9BBD0",
            fillOpacity: 0,
            showDot: true,
            smoothCurves: true,
            strokeOpacity: 1,
            stackId: "bar-two",
            style: {
              strokeDasharray: "6, 3",
              strokeWidth: 1,
            },
          },
        ]}
        xAxis={{ key: "name", label: xAxisLabel }}
        yAxis={{ key: "current", label: yAxisLabel }}
        margin={{ bottom: 30 }}
        className="h-[370px] w-full"
        legend={{
          align: "center",
          verticalAlign: "bottom",
          layout: "horizontal",
          wrapperStyles: {
            marginTop: 20,
          },
        }}
      />
    </div>
  );
};

export default ProgressChart;
