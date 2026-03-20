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

export type TCycleKpiLabelPointsItem = {
  key: string;
  name: string;
  color: string;
  points: number;
  issueCount: number;
  issues: TCycleKpiIssueSummary[];
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
  unestimatedIssueCount: number;
  issues: TCycleKpiIssueSummary[];
};

export type TCycleKpiIssueSummary = {
  id: string;
  sequenceId: number;
  name: string;
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

const getChartCutoffDate = (cycleEndDate: Date) => {
  const today = normalizeDate(new Date());
  const normalizedCycleEndDate = normalizeDate(cycleEndDate);

  return normalizedCycleEndDate < today ? normalizedCycleEndDate : today;
};

const matchesAssigneeFilter = (issue: TIssue, selectedAssigneeSet: Set<string>) =>
  selectedAssigneeSet.size === 0 || issue.assignee_ids?.some((assigneeId) => selectedAssigneeSet.has(assigneeId));

const matchesLabelFilter = (issue: TIssue, selectedLabelSet: Set<string>) =>
  selectedLabelSet.size === 0 || issue.label_ids?.some((labelId) => selectedLabelSet.has(labelId));

const isCompletedLikeGroup = (group: string | null | undefined) => group === "completed" || group === "cancelled";

const getLateCompletionFallbackStateId = (projectStates: IState[]) =>
  projectStates.find((state) => state.group === "started")?.id ??
  projectStates.find((state) => state.group === "unstarted")?.id ??
  projectStates.find((state) => state.group === "backlog")?.id ??
  undefined;

const getIssueSummary = (issue: TIssue): TCycleKpiIssueSummary => ({
  id: issue.id,
  sequenceId: issue.sequence_id,
  name: issue.name,
});

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
  const chartCutoffDate = getChartCutoffDate(cycleEndDate);
  const today = normalizeDate(new Date());
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
  const labelPointsMap = new Map<string, { points: number; issueIds: Set<string>; issues: TCycleKpiIssueSummary[] }>();

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
      const current = labelPointsMap.get(aggregationKey) ?? {
        points: 0,
        issueIds: new Set<string>(),
        issues: [],
      };
      current.points += estimatePoints;
      if (!current.issueIds.has(issue.id)) {
        current.issueIds.add(issue.id);
        current.issues.push(getIssueSummary(issue));
      }
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
          issues: [...aggregate.issues].sort((a, b) => a.sequenceId - b.sequenceId),
        };
      }

      if (labelId === UNKNOWN_LABEL_KEY) {
        return {
          key: labelId,
          name: "Unknown label",
          color: DEFAULT_BAR_COLOR,
          points: aggregate.points,
          issueCount: aggregate.issueIds.size,
          issues: [...aggregate.issues].sort((a, b) => a.sequenceId - b.sequenceId),
        };
      }

      const label = labelById.get(labelId);
      return {
        key: labelId,
        name: label?.name ?? "Unknown label",
        color: label?.color ?? DEFAULT_BAR_COLOR,
        points: aggregate.points,
        issueCount: aggregate.issueIds.size,
        issues: [...aggregate.issues].sort((a, b) => a.sequenceId - b.sequenceId),
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
  cycleEndDate,
  getEstimatePointValue,
}: TBuildCycleKpiStatePointsParams): TCycleKpiStatePointsData => {
  const selectedLabelSet = new Set(selectedLabelIds);
  const selectedAssigneeSet = new Set(selectedAssigneeIds);
  const chartCutoffDate = getChartCutoffDate(cycleEndDate);
  const matchingIssues = issues.filter(
    (issue) => matchesLabelFilter(issue, selectedLabelSet) && matchesAssigneeFilter(issue, selectedAssigneeSet)
  );
  const stateById = new Map(projectStates.map((state) => [state.id, state]));
  const lateCompletionFallbackStateId = getLateCompletionFallbackStateId(projectStates);
  const statePointsMap = new Map<
    string,
    {
      points: number;
      issueIds: Set<string>;
      issues: TCycleKpiIssueSummary[];
      unestimatedIssueCount: number;
    }
  >();

  let matchingEstimatedIssuesCount = 0;

  matchingIssues.forEach((issue) => {
    const estimatePoints = getEstimatePointValue(issue.estimate_point);
    const isEstimated = estimatePoints > 0;
    if (isEstimated) matchingEstimatedIssuesCount += 1;

    const completedDate = getDate(issue.completed_at);
    const issueState = issue.state_id ? stateById.get(issue.state_id) : undefined;
    const issueGroup = issueState?.group ?? issue.state__group;
    const isLateCompletion = !!completedDate && completedDate > chartCutoffDate && isCompletedLikeGroup(issueGroup);
    let stateKey = NO_STATE_KEY;
    if (isLateCompletion) {
      stateKey = lateCompletionFallbackStateId ?? NO_STATE_KEY;
    } else if (issue.state_id) {
      stateKey = stateById.has(issue.state_id) ? issue.state_id : UNKNOWN_STATE_KEY;
    }

    const current = statePointsMap.get(stateKey) ?? {
      points: 0,
      issueIds: new Set<string>(),
      issues: [],
      unestimatedIssueCount: 0,
    };
    if (isEstimated) {
      current.points += estimatePoints;
    } else {
      current.unestimatedIssueCount += 1;
    }
    if (!current.issueIds.has(issue.id)) {
      current.issueIds.add(issue.id);
      current.issues.push(getIssueSummary(issue));
    }
    statePointsMap.set(stateKey, current);
  });

  const data = Array.from(statePointsMap.entries())
    .map(([stateKey, aggregate]) => {
      if (stateKey === NO_STATE_KEY) {
        const stateName = "No state";
        return {
          key: stateKey,
          name: aggregate.unestimatedIssueCount > 0 ? `${stateName}*` : stateName,
          color: DEFAULT_BAR_COLOR,
          points: aggregate.points,
          issueCount: aggregate.issueIds.size,
          unestimatedIssueCount: aggregate.unestimatedIssueCount,
          issues: [...aggregate.issues].sort((a, b) => a.sequenceId - b.sequenceId),
        };
      }

      if (stateKey === UNKNOWN_STATE_KEY) {
        const stateName = "Unknown state";
        return {
          key: stateKey,
          name: aggregate.unestimatedIssueCount > 0 ? `${stateName}*` : stateName,
          color: DEFAULT_BAR_COLOR,
          points: aggregate.points,
          issueCount: aggregate.issueIds.size,
          unestimatedIssueCount: aggregate.unestimatedIssueCount,
          issues: [...aggregate.issues].sort((a, b) => a.sequenceId - b.sequenceId),
        };
      }

      const state = stateById.get(stateKey);
      const stateName = state?.name ?? "Unknown state";
      return {
        key: stateKey,
        name: aggregate.unestimatedIssueCount > 0 ? `${stateName}*` : stateName,
        color: state?.color ?? DEFAULT_BAR_COLOR,
        points: aggregate.points,
        issueCount: aggregate.issueIds.size,
        unestimatedIssueCount: aggregate.unestimatedIssueCount,
        issues: [...aggregate.issues].sort((a, b) => a.sequenceId - b.sequenceId),
      };
    })
    .sort((a, b) => b.points - a.points || a.name.localeCompare(b.name));

  return {
    data,
    matchingIssuesCount: matchingIssues.length,
    matchingEstimatedIssuesCount,
  };
};
