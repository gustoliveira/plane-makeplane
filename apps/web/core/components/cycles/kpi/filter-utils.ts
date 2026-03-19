import type { IIssueLabel, IState, TIssue, TCycleCompletionChartDistribution } from "@plane/types";
import { getDate } from "@plane/utils";

type TBuildCycleKpiBurndownParams = {
  issues: TIssue[];
  selectedLabelIds: string[];
  selectedAssigneeIds: string[];
  cycleStartDate: Date;
  cycleEndDate: Date;
  getEstimatePointValue: (estimatePointId: string | null) => number;
};

type TBuildCycleKpiLabelPointsParams = {
  issues: TIssue[];
  projectLabels: IIssueLabel[];
  selectedLabelIds: string[];
  selectedAssigneeIds: string[];
  getEstimatePointValue: (estimatePointId: string | null) => number;
};

type TBuildCycleKpiStatePointsParams = {
  issues: TIssue[];
  projectStates: IState[];
  selectedLabelIds: string[];
  selectedAssigneeIds: string[];
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

export type TCycleKpiLabelPointsItem = {
  key: string;
  name: string;
  color: string;
  points: number;
  issueCount: number;
};

export type TCycleKpiLabelPointsData = {
  data: TCycleKpiLabelPointsItem[];
  matchingIssuesCount: number;
  matchingEstimatedIssuesCount: number;
};

export type TCycleKpiStatePointsItem = {
  key: string;
  name: string;
  color: string;
  points: number;
  issueCount: number;
};

export type TCycleKpiStatePointsData = {
  data: TCycleKpiStatePointsItem[];
  matchingIssuesCount: number;
  matchingEstimatedIssuesCount: number;
};

const NO_LABEL_KEY = "__no_label__";
const UNKNOWN_LABEL_KEY = "__unknown_label__";
const NO_STATE_KEY = "__no_state__";
const UNKNOWN_STATE_KEY = "__unknown_state__";
const DEFAULT_BAR_COLOR = "#3F76FF";

const getDateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const normalizeDate = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());

const matchesAssigneeFilter = (issue: TIssue, selectedAssigneeSet: Set<string>) =>
  selectedAssigneeSet.size === 0 || issue.assignee_ids?.some((assigneeId) => selectedAssigneeSet.has(assigneeId));

const matchesLabelFilter = (issue: TIssue, selectedLabelSet: Set<string>) =>
  selectedLabelSet.size === 0 || issue.label_ids?.some((labelId) => selectedLabelSet.has(labelId));

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
  selectedAssigneeIds,
  cycleStartDate,
  cycleEndDate,
  getEstimatePointValue,
}: TBuildCycleKpiBurndownParams): TCycleKpiBurndownData => {
  const selectedLabelSet = new Set(selectedLabelIds);
  const selectedAssigneeSet = new Set(selectedAssigneeIds);
  const today = normalizeDate(new Date());
  const chartCutoffDate = cycleEndDate < today ? normalizeDate(cycleEndDate) : today;
  const matchingIssues = issues.filter(
    (issue) => matchesLabelFilter(issue, selectedLabelSet) && matchesAssigneeFilter(issue, selectedAssigneeSet)
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

export const buildCycleKpiLabelPointsData = ({
  issues,
  projectLabels,
  selectedLabelIds,
  selectedAssigneeIds,
  getEstimatePointValue,
}: TBuildCycleKpiLabelPointsParams): TCycleKpiLabelPointsData => {
  const selectedLabelSet = new Set(selectedLabelIds);
  const selectedAssigneeSet = new Set(selectedAssigneeIds);
  const matchingIssues = issues.filter(
    (issue) => matchesLabelFilter(issue, selectedLabelSet) && matchesAssigneeFilter(issue, selectedAssigneeSet)
  );
  const labelById = new Map(projectLabels.map((label) => [label.id, label]));
  const labelPointsMap = new Map<string, { points: number; issueIds: Set<string> }>();

  let matchingEstimatedIssuesCount = 0;

  matchingIssues.forEach((issue) => {
    const estimatePoints = getEstimatePointValue(issue.estimate_point);
    if (estimatePoints <= 0) return;

    matchingEstimatedIssuesCount += 1;
    const issueLabelIds = issue.label_ids?.length ? Array.from(new Set(issue.label_ids)) : [NO_LABEL_KEY];
    const labelIdsToAggregate =
      selectedLabelSet.size > 0 ? issueLabelIds.filter((labelId) => selectedLabelSet.has(labelId)) : issueLabelIds;

    labelIdsToAggregate.forEach((labelId) => {
      const aggregationKey =
        labelId === NO_LABEL_KEY ? NO_LABEL_KEY : labelById.has(labelId) ? labelId : UNKNOWN_LABEL_KEY;
      const current = labelPointsMap.get(aggregationKey) ?? { points: 0, issueIds: new Set<string>() };
      current.points += estimatePoints;
      current.issueIds.add(issue.id);
      labelPointsMap.set(aggregationKey, current);
    });
  });

  const data = Array.from(labelPointsMap.entries())
    .map(([labelId, aggregate]) => {
      if (labelId === NO_LABEL_KEY) {
        return {
          key: labelId,
          name: "No label",
          color: DEFAULT_BAR_COLOR,
          points: aggregate.points,
          issueCount: aggregate.issueIds.size,
        };
      }

      if (labelId === UNKNOWN_LABEL_KEY) {
        return {
          key: labelId,
          name: "Unknown label",
          color: DEFAULT_BAR_COLOR,
          points: aggregate.points,
          issueCount: aggregate.issueIds.size,
        };
      }

      const label = labelById.get(labelId);
      return {
        key: labelId,
        name: label?.name ?? "Unknown label",
        color: label?.color ?? DEFAULT_BAR_COLOR,
        points: aggregate.points,
        issueCount: aggregate.issueIds.size,
      };
    })
    .sort((a, b) => b.points - a.points || a.name.localeCompare(b.name));

  return {
    data,
    matchingIssuesCount: matchingIssues.length,
    matchingEstimatedIssuesCount,
  };
};

export const buildCycleKpiStatePointsData = ({
  issues,
  projectStates,
  selectedLabelIds,
  selectedAssigneeIds,
  getEstimatePointValue,
}: TBuildCycleKpiStatePointsParams): TCycleKpiStatePointsData => {
  const selectedLabelSet = new Set(selectedLabelIds);
  const selectedAssigneeSet = new Set(selectedAssigneeIds);
  const matchingIssues = issues.filter(
    (issue) => matchesLabelFilter(issue, selectedLabelSet) && matchesAssigneeFilter(issue, selectedAssigneeSet)
  );
  const stateById = new Map(projectStates.map((state) => [state.id, state]));
  const statePointsMap = new Map<string, { points: number; issueIds: Set<string> }>();

  let matchingEstimatedIssuesCount = 0;

  matchingIssues.forEach((issue) => {
    const estimatePoints = getEstimatePointValue(issue.estimate_point);
    if (estimatePoints <= 0) return;

    matchingEstimatedIssuesCount += 1;

    let stateKey = NO_STATE_KEY;
    if (issue.state_id) {
      stateKey = stateById.has(issue.state_id) ? issue.state_id : UNKNOWN_STATE_KEY;
    }

    const current = statePointsMap.get(stateKey) ?? { points: 0, issueIds: new Set<string>() };
    current.points += estimatePoints;
    current.issueIds.add(issue.id);
    statePointsMap.set(stateKey, current);
  });

  const data = Array.from(statePointsMap.entries())
    .map(([stateKey, aggregate]) => {
      if (stateKey === NO_STATE_KEY) {
        return {
          key: stateKey,
          name: "No state",
          color: DEFAULT_BAR_COLOR,
          points: aggregate.points,
          issueCount: aggregate.issueIds.size,
        };
      }

      if (stateKey === UNKNOWN_STATE_KEY) {
        return {
          key: stateKey,
          name: "Unknown state",
          color: DEFAULT_BAR_COLOR,
          points: aggregate.points,
          issueCount: aggregate.issueIds.size,
        };
      }

      const state = stateById.get(stateKey);
      return {
        key: stateKey,
        name: state?.name ?? "Unknown state",
        color: state?.color ?? DEFAULT_BAR_COLOR,
        points: aggregate.points,
        issueCount: aggregate.issueIds.size,
      };
    })
    .sort((a, b) => b.points - a.points || a.name.localeCompare(b.name));

  return {
    data,
    matchingIssuesCount: matchingIssues.length,
    matchingEstimatedIssuesCount,
  };
};
