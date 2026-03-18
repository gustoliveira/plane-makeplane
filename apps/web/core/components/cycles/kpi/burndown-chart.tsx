import React from "react";
// plane imports
import { AreaChart } from "@plane/propel/charts/area-chart";
import type { TChartData, TCycleCompletionChartDistribution } from "@plane/types";
import { renderFormattedDateWithoutYear } from "@plane/utils";

type Props = {
  distribution: TCycleCompletionChartDistribution;
  totalEstimatePoints: number;
  className?: string;
};

export const KpiBurndownChart: React.FC<Props> = ({ distribution, totalEstimatePoints, className = "" }) => {
  const distributionKeys = Object.keys(distribution ?? []);
  const stepCount = Math.max(distributionKeys.length - 1, 1);

  const rawValues = distributionKeys
    .map((key) => distribution[key])
    .filter((value): value is number => typeof value === "number");

  const shouldTreatAsNegativeCompleted = rawValues.some((value) => value < 0);
  const shouldTreatAsCompletedProgress =
    !shouldTreatAsNegativeCompleted && rawValues.length > 1 && rawValues[0] <= rawValues[rawValues.length - 1];

  const chartData = distributionKeys.map((key, index) => {
    const rawCurrent = distribution[key];
    let normalizedCurrent = rawCurrent;

    if (typeof rawCurrent === "number") {
      let nextCurrent = rawCurrent;

      if (shouldTreatAsNegativeCompleted) {
        nextCurrent = totalEstimatePoints + rawCurrent;
      } else if (shouldTreatAsCompletedProgress) {
        nextCurrent = totalEstimatePoints - rawCurrent;
      }

      normalizedCurrent = Math.min(totalEstimatePoints, Math.max(0, nextCurrent));
    }

    return {
      name: renderFormattedDateWithoutYear(key),
      current: normalizedCurrent,
      ideal: totalEstimatePoints * (1 - index / stepCount),
    };
  }) as unknown as TChartData<string, string>[];

  return (
    <div className={`flex w-full items-center justify-center ${className}`}>
      <AreaChart
        data={chartData}
        areas={[
          {
            key: "current",
            label: "Current remaining points",
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
            label: "Ideal remaining points",
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
        xAxis={{ key: "name", label: "Time" }}
        yAxis={{ key: "current", label: "Remaining points", domain: [0, Math.max(totalEstimatePoints, 1)] }}
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
