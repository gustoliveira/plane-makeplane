import React from "react";
// plane imports
import { BarChart } from "@plane/propel/charts/bar-chart";
import type { TChartData } from "@plane/types";
// components
import type { TCycleKpiLabelPointsItem } from "@/components/cycles/kpi/filter-utils";

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
  })) as unknown as TChartData<"name", "points">[];

  return (
    <div className={`flex w-full items-center justify-center ${className}`}>
      <BarChart
        className="h-[350px] w-full"
        data={chartData}
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
      />
    </div>
  );
};
