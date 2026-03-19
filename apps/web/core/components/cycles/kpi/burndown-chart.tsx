import React from "react";
import type { ComponentType } from "react";
// plane imports
import { AreaChart } from "@plane/propel/charts/area-chart";
import type { TChartData, TCycleCompletionChartDistribution } from "@plane/types";
import { getDate, renderFormattedDateWithoutYear } from "@plane/utils";

type TKpiWeekendXAxisTickProps = {
  x?: number;
  y?: number;
  payload?: {
    value?: string;
  };
};

const KpiWeekendXAxisTick = React.memo<TKpiWeekendXAxisTickProps>(({ x = 0, y = 0, payload }) => {
  const rawDate = getDate(payload?.value);
  const isWeekend = rawDate ? [0, 6].includes(rawDate.getDay()) : false;
  const label = payload?.value ? renderFormattedDateWithoutYear(payload.value) : "";

  return (
    <g transform={`translate(${x},${y})`}>
      <text
        y={0}
        dy={18}
        textAnchor="end"
        transform="rotate(-32)"
        className="text-xs"
        fill={isWeekend ? "#ef4444" : "#6b7280"}
      >
        {label}
      </text>
    </g>
  );
});
KpiWeekendXAxisTick.displayName = "KpiWeekendXAxisTick";

const KpiWeekendXAxisTickComponent = KpiWeekendXAxisTick as unknown as ComponentType<unknown>;

type Props = {
  distribution: TCycleCompletionChartDistribution;
  totalEstimatePoints: number;
  className?: string;
};

export const KpiBurndownChart: React.FC<Props> = ({ distribution, totalEstimatePoints, className = "" }) => {
  const distributionKeys = Object.keys(distribution ?? []);
  const stepCount = Math.max(distributionKeys.length - 1, 1);
  const xAxisConfig = {
    key: "rawDate",
    label: "Time",
    interval: 0,
    minTickGap: 0,
    ticks: distributionKeys,
  } as unknown as {
    key: string;
    label?: string;
    strokeColor?: string;
    dy?: number;
    minTickGap?: number;
    ticks?: Array<string | number>;
  };

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
    rawDate: key,
    current: normalizeCurrentValue(distribution[key]),
    ideal: totalEstimatePoints * (1 - index / stepCount),
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
        ]}
        xAxis={xAxisConfig}
        yAxis={{ key: "current", label: "Remaining points", domain: [0, Math.max(totalEstimatePoints, 1)] }}
        customTicks={{ x: KpiWeekendXAxisTickComponent }}
        margin={{ bottom: 48 }}
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
