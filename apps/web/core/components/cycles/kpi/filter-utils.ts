import type { TIssue, TCycleCompletionChartDistribution } from "@plane/types";
import { getDate } from "@plane/utils";

type TBuildCycleKpiBurndownParams = {
  issues: TIssue[];
  selectedLabelIds: string[];
  cycleStartDate: Date;
  cycleEndDate: Date;
  getEstimatePointValue: (estimatePointId: string | null) => number;
};

export type TCycleKpiBurndownData = {
  distribution: TCycleCompletionChartDistribution;
  totalEstimatePoints: number;
  completedEstimatePoints: number;
  pendingEstimatePoints: number;
  currentRemainingEstimatePoints: number;
  currentCompletedEstimatePoints: number;
  matchingIssuesCount: number;
  matchingEstimatedIssuesCount: number;
};

const getDateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const normalizeDate = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());

const getDateRange = (startDate: Date, endDate: Date) => {
  const dates: Date[] = [];
  const cursor = normalizeDate(startDate);
  const lastDate = normalizeDate(endDate);

  while (cursor <= lastDate) {
    dates.push(new Date(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }

  return dates;
};

export const buildCycleKpiBurndownData = ({
  issues,
  selectedLabelIds,
  cycleStartDate,
  cycleEndDate,
  getEstimatePointValue,
}: TBuildCycleKpiBurndownParams): TCycleKpiBurndownData => {
  const selectedLabelSet = new Set(selectedLabelIds);
  const today = normalizeDate(new Date());
  const chartCutoffDate = cycleEndDate < today ? normalizeDate(cycleEndDate) : today;
  const matchingIssues = issues.filter(
    (issue) => selectedLabelSet.size === 0 || issue.label_ids?.some((labelId) => selectedLabelSet.has(labelId))
  );

  const estimatedIssues = matchingIssues
    .map((issue) => ({
      issue,
      estimatePoints: getEstimatePointValue(issue.estimate_point),
      completedDate: getDate(issue.completed_at),
    }))
    .filter((item) => item.estimatePoints > 0);

  const totalEstimatePoints = estimatedIssues.reduce((total, item) => total + item.estimatePoints, 0);
  const completedEstimatePoints = estimatedIssues.reduce((total, item) => {
    if (!item.completedDate || item.issue.state__group === "cancelled") return total;
    return total + item.estimatePoints;
  }, 0);
  const currentCompletedEstimatePoints = estimatedIssues.reduce((total, item) => {
    if (!item.completedDate || item.issue.state__group === "cancelled") return total;
    return item.completedDate <= chartCutoffDate ? total + item.estimatePoints : total;
  }, 0);

  const distribution = getDateRange(cycleStartDate, cycleEndDate).reduce<TCycleCompletionChartDistribution>(
    (acc, date) => {
      const dateKey = getDateKey(date);

      if (date > today) {
        acc[dateKey] = null;
        return acc;
      }

      const completedThroughDate = estimatedIssues.reduce((total, item) => {
        if (!item.completedDate || item.issue.state__group === "cancelled") return total;
        return item.completedDate <= date ? total + item.estimatePoints : total;
      }, 0);

      acc[dateKey] = Math.max(0, totalEstimatePoints - completedThroughDate);
      return acc;
    },
    {}
  );

  return {
    distribution,
    totalEstimatePoints,
    completedEstimatePoints,
    pendingEstimatePoints: Math.max(0, totalEstimatePoints - currentCompletedEstimatePoints),
    currentRemainingEstimatePoints: Math.max(0, totalEstimatePoints - currentCompletedEstimatePoints),
    currentCompletedEstimatePoints,
    matchingIssuesCount: matchingIssues.length,
    matchingEstimatedIssuesCount: estimatedIssues.length,
  };
};
