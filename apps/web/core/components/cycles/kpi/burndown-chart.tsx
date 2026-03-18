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

  const normalizeCurrentValue = (value: number | null) => {
    if (typeof value !== "number") return value;

    let nextCurrent = value;

    if (shouldTreatAsNegativeCompleted) {
      nextCurrent = totalEstimatePoints + value;
    } else if (shouldTreatAsCompletedProgress) {
      nextCurrent = totalEstimatePoints - value;
    }

    return Math.min(totalEstimatePoints, Math.max(0, nextCurrent));
  };

  const normalizedValues = distributionKeys.map((key, index) => ({
    index,
    current: normalizeCurrentValue(distribution[key]),
  }));

  const tendencyAnchors = normalizedValues.filter(
    (value): value is { index: number; current: number } => typeof value.current === "number"
  );

  const tendencyValues =
    tendencyAnchors.length >= 2
      ? (() => {
          const firstPoint = tendencyAnchors[0];
          const lastPoint = tendencyAnchors[tendencyAnchors.length - 1];
          const slope =
            lastPoint.index === firstPoint.index
              ? 0
              : (lastPoint.current - firstPoint.current) / (lastPoint.index - firstPoint.index);

          return normalizedValues.map(({ index }) =>
            Math.min(totalEstimatePoints, Math.max(0, firstPoint.current + slope * (index - firstPoint.index)))
          );
        })()
      : null;

  const chartData = distributionKeys.map((key, index) => ({
    name: renderFormattedDateWithoutYear(key),
    current: normalizedValues[index]?.current,
    ideal: totalEstimatePoints * (1 - index / stepCount),
    tendency: tendencyValues?.[index] ?? null,
  })) as unknown as TChartData<string, string>[];

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
          {
            key: "tendency",
            label: "Tendency remaining points",
            strokeColor: "#F59E0B",
            fill: "#F59E0B",
            fillOpacity: 0,
            showDot: false,
            smoothCurves: false,
            strokeOpacity: tendencyValues ? 1 : 0,
            stackId: "bar-three",
            style: {
              strokeDasharray: "3, 3",
              strokeWidth: 2,
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
