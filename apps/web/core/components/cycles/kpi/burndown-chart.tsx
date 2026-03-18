import React from "react";
// plane imports
import { AreaChart } from "@plane/propel/charts/area-chart";
import type { TChartData, TCycleCompletionChartDistribution } from "@plane/types";
import { renderFormattedDateWithoutYear } from "@plane/utils";

const KPI_TOOLTIP_LABELS: Record<string, string> = {
  current: "Current remaining points",
  ideal: "Ideal remaining points",
};

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

  const chartData = distributionKeys.map((key, index) => ({
    name: renderFormattedDateWithoutYear(key),
    current: normalizeCurrentValue(distribution[key]),
    ideal: totalEstimatePoints * (1 - index / stepCount),
  })) as unknown as TChartData<string, string>[];

  const formatTooltipValue = (value: unknown): string => {
    if (typeof value === "number") return value.toFixed(2);
    if (typeof value === "string") return value;
    if (Array.isArray(value)) return value.join(", ");
    return "-";
  };

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
        customTooltipContent={({ active, label, payload }) => {
          const filteredPayload = (payload ?? []).filter((item: { dataKey?: string }) =>
            item.dataKey ? Object.keys(KPI_TOOLTIP_LABELS).includes(item.dataKey) : false
          );

          if (!active || !filteredPayload.length) return null;

          return (
            <div className="flex w-[14rem] flex-col gap-2 rounded-md border border-custom-border-200 bg-custom-background-100 p-3 shadow-lg">
              <p className="truncate border-b border-custom-border-200 pb-2 text-xs font-medium text-custom-text-100">
                {label}
              </p>
              {filteredPayload.map((item: { dataKey?: string; color?: string; value?: unknown }) => {
                if (!item.dataKey) return null;

                return (
                  <div key={item.dataKey} className="flex items-center gap-2 text-xs">
                    <div className="flex items-center gap-2 truncate">
                      <div
                        className="size-2 flex-shrink-0 rounded-sm"
                        style={{ backgroundColor: item.color ?? "#3F76FF" }}
                      />
                      <span className="truncate text-custom-text-300">{KPI_TOOLTIP_LABELS[item.dataKey]}:</span>
                    </div>
                    <span className="ml-auto flex-shrink-0 font-medium text-custom-text-200">
                      {formatTooltipValue(item.value)}
                    </span>
                  </div>
                );
              })}
            </div>
          );
        }}
      />
    </div>
  );
};
