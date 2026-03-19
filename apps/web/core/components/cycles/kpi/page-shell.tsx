"use client";

import type { FC } from "react";
import { useEffect, useMemo, useState } from "react";
import { observer } from "mobx-react";
import { useParams } from "next/navigation";
import { X, ChevronDown } from "lucide-react";
// plane imports
import type { TIssue } from "@plane/types";
import { Loader } from "@plane/ui";
import { getDate, renderFormattedDateWithoutYear } from "@plane/utils";
// components
import { EmptyState } from "@/components/common/empty-state";
import { PageHead } from "@/components/core/page-title";
import useCyclesDetails from "@/components/cycles/active-cycle/use-cycles-details";
import { KpiBurndownChart } from "@/components/cycles/kpi/burndown-chart";
import { buildCycleKpiBurndownData, buildCycleKpiLabelPointsData } from "@/components/cycles/kpi/filter-utils";
import { KpiLabelPointsChart } from "@/components/cycles/kpi/label-points-chart";
import { MemberDropdown } from "@/components/dropdowns/member/dropdown";
import { LabelDropdown } from "@/components/issues/issue-layouts/properties/label-dropdown";
// hooks
import { useProjectEstimates } from "@/hooks/store/estimates";
import { useCycle } from "@/hooks/store/use-cycle";
import { useLabel } from "@/hooks/store/use-label";
import { useProject } from "@/hooks/store/use-project";
import { useAppRouter } from "@/hooks/use-app-router";
// assets
import emptyCycle from "@/public/empty-state/cycle.svg";
// services
import { CycleService } from "@/services/cycle.service";

const cycleService = new CycleService();

const KpiStat: FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="rounded-[10px] border border-custom-border-200 bg-custom-background-90 px-4 py-3">
    <p className="text-xs font-semibold uppercase tracking-[0.08em] text-custom-text-300">{label}</p>
    <p className="mt-1 text-lg font-semibold text-custom-text-100">{value}</p>
  </div>
);

const fetchAllCycleIssues = async (workspaceSlug: string, projectId: string, cycleId: string): Promise<TIssue[]> => {
  const perPage = 1000;
  let nextCursor: string | undefined = undefined;
  const allIssues: TIssue[] = [];

  while (true) {
    const response = await cycleService.getCycleIssues(workspaceSlug, projectId, cycleId, {
      per_page: perPage,
      ...(nextCursor ? { cursor: nextCursor } : {}),
    });

    const responseIssues = Array.isArray(response.results) ? response.results : [];
    allIssues.push(...responseIssues);

    if (!response.next_page_results || !response.next_cursor) break;
    nextCursor = response.next_cursor;
  }

  return Array.from(new Map(allIssues.map((issue) => [issue.id, issue])).values());
};

const countBusinessDaysUntilEnd = (endDate: Date | null | undefined) => {
  if (!endDate) return null;

  const today = new Date();
  const cursor = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const lastDate = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());

  if (lastDate < cursor) return 0;

  let businessDays = 0;
  while (cursor <= lastDate) {
    const day = cursor.getDay();
    if (day !== 0 && day !== 6) businessDays += 1;
    cursor.setDate(cursor.getDate() + 1);
  }

  return businessDays;
};

const getBusinessDaysUntilEndLabel = (endDate: Date | null | undefined, businessDaysUntilEnd: number | null) => {
  if (!endDate || businessDaysUntilEnd === null) return "Not available";

  const today = new Date();
  const normalizedToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const normalizedEndDate = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());

  if (normalizedEndDate < normalizedToday) return "Cycle ended";
  if (businessDaysUntilEnd === 0) return "Cycle ends today";

  return `${businessDaysUntilEnd} business day${businessDaysUntilEnd === 1 ? "" : "s"}`;
};

export const CycleKpiPageShell = observer(() => {
  const router = useAppRouter();
  const { workspaceSlug, projectId, cycleId } = useParams() as {
    workspaceSlug: string;
    projectId: string;
    cycleId: string;
  };

  const { getCycleById, fetchCycleDetails } = useCycle();
  const { fetchProjectLabels, getProjectLabels } = useLabel();
  const { getProjectById } = useProject();
  const { currentActiveEstimateIdByProjectId, getEstimateById, getProjectEstimates } = useProjectEstimates();

  const cycle = cycleId ? getCycleById(cycleId) : null;
  const project = projectId ? getProjectById(projectId) : null;
  const projectLabels = useMemo(() => getProjectLabels(projectId) ?? [], [getProjectLabels, projectId]);
  const activeEstimateId = projectId ? currentActiveEstimateIdByProjectId(projectId) : undefined;
  const activeEstimate = activeEstimateId ? getEstimateById(activeEstimateId) : undefined;

  const [isCycleLoading, setIsCycleLoading] = useState(() => !!cycleId && !cycle);
  const [didCycleFetchFail, setDidCycleFetchFail] = useState(false);
  const [cycleIssues, setCycleIssues] = useState<TIssue[]>([]);
  const [isFilterDataLoading, setIsFilterDataLoading] = useState(true);
  const [didFilterDataFail, setDidFilterDataFail] = useState(false);
  const [selectedLabelIds, setSelectedLabelIds] = useState<string[]>([]);
  const [selectedAssigneeIds, setSelectedAssigneeIds] = useState<string[]>([]);

  useCyclesDetails({
    workspaceSlug,
    projectId,
    cycleId,
  });

  useEffect(() => {
    if (!workspaceSlug || !projectId || !cycleId || cycle) return;

    let isMounted = true;
    setIsCycleLoading(true);
    setDidCycleFetchFail(false);

    fetchCycleDetails(workspaceSlug, projectId, cycleId)
      .catch(() => {
        if (isMounted) setDidCycleFetchFail(true);
      })
      .finally(() => {
        if (isMounted) setIsCycleLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [workspaceSlug, projectId, cycleId, cycle, fetchCycleDetails]);

  useEffect(() => {
    if (!workspaceSlug || !projectId || !cycleId) return;

    let isMounted = true;
    setIsFilterDataLoading(true);
    setDidFilterDataFail(false);

    Promise.all([
      fetchAllCycleIssues(workspaceSlug, projectId, cycleId),
      fetchProjectLabels(workspaceSlug, projectId),
      getProjectEstimates(workspaceSlug, projectId),
    ])
      .then(([issues]) => {
        if (isMounted) setCycleIssues(issues);
      })
      .catch(() => {
        if (isMounted) {
          setDidFilterDataFail(true);
          setCycleIssues([]);
        }
      })
      .finally(() => {
        if (isMounted) setIsFilterDataLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [workspaceSlug, projectId, cycleId, fetchProjectLabels, getProjectEstimates]);

  const pageTitle = useMemo(() => {
    if (project?.name && cycle?.name) return `${project.name} - ${cycle.name} KPI`;
    if (cycle?.name) return `${cycle.name} KPI`;
    return "Cycle KPI";
  }, [project?.name, cycle?.name]);

  const cycleStartDate = getDate(cycle?.start_date);
  const cycleEndDate = getDate(cycle?.end_date);
  const hasValidCycleDates = !!cycleStartDate && !!cycleEndDate && cycleEndDate >= cycleStartDate;
  const cycleLabelIds = useMemo(
    () => Array.from(new Set(cycleIssues.flatMap((issue) => issue.label_ids ?? []))),
    [cycleIssues]
  );
  const cycleAssigneeIds = useMemo(
    () => Array.from(new Set(cycleIssues.flatMap((issue) => issue.assignee_ids ?? []))),
    [cycleIssues]
  );
  const availableLabels = useMemo(
    () => projectLabels.filter((label) => cycleLabelIds.includes(label.id)),
    [projectLabels, cycleLabelIds]
  );
  const selectedLabels = useMemo(
    () => availableLabels.filter((label) => selectedLabelIds.includes(label.id)),
    [availableLabels, selectedLabelIds]
  );
  const selectedLabelSummary =
    selectedLabels.length === 0
      ? "All labels"
      : selectedLabels.length === 1
        ? selectedLabels[0].name
        : `${selectedLabels[0].name} +${selectedLabels.length - 1}`;
  const selectedAssigneesSummary =
    selectedAssigneeIds.length === 0
      ? "All users"
      : `${selectedAssigneeIds.length} user${selectedAssigneeIds.length === 1 ? "" : "s"}`;

  const filteredBurndown = useMemo(() => {
    if (!cycleStartDate || !cycleEndDate || !activeEstimate) return undefined;

    return buildCycleKpiBurndownData({
      issues: cycleIssues,
      selectedLabelIds,
      selectedAssigneeIds,
      cycleStartDate,
      cycleEndDate,
      getEstimatePointValue: (estimatePointId) => {
        if (!estimatePointId) return 0;
        return Number(activeEstimate.estimatePointById(estimatePointId)?.value ?? 0);
      },
    });
  }, [cycleIssues, selectedLabelIds, selectedAssigneeIds, cycleStartDate, cycleEndDate, activeEstimate]);

  const labelPointsData = useMemo(() => {
    if (!activeEstimate) return undefined;

    return buildCycleKpiLabelPointsData({
      issues: cycleIssues,
      projectLabels,
      selectedAssigneeIds,
      getEstimatePointValue: (estimatePointId) => {
        if (!estimatePointId) return 0;
        return Number(activeEstimate.estimatePointById(estimatePointId)?.value ?? 0);
      },
    });
  }, [cycleIssues, projectLabels, selectedAssigneeIds, activeEstimate]);

  const defaultTotalEstimatePoints =
    cycle?.progress_snapshot?.total_estimate_points ?? cycle?.total_estimate_points ?? 0;
  const defaultCompletedEstimatePoints =
    cycle?.progress_snapshot?.completed_estimate_points ?? cycle?.completed_estimate_points ?? 0;
  const defaultPendingEstimatePoints =
    (cycle?.progress_snapshot?.backlog_estimate_points ?? cycle?.backlog_estimate_points ?? 0) +
    (cycle?.progress_snapshot?.unstarted_estimate_points ?? cycle?.unstarted_estimate_points ?? 0) +
    (cycle?.progress_snapshot?.started_estimate_points ?? cycle?.started_estimate_points ?? 0);

  const totalEstimatePoints = filteredBurndown?.totalEstimatePoints ?? defaultTotalEstimatePoints;
  const completedEstimatePoints = filteredBurndown?.currentCompletedEstimatePoints ?? defaultCompletedEstimatePoints;
  const pendingEstimatePoints = filteredBurndown?.currentRemainingEstimatePoints ?? defaultPendingEstimatePoints;
  const matchingIssuesCount = filteredBurndown?.matchingIssuesCount ?? 0;
  const matchingEstimatedIssuesCount = filteredBurndown?.matchingEstimatedIssuesCount ?? 0;
  const labelPointsChartData = labelPointsData?.data ?? [];
  const labelPointsMatchingIssuesCount = labelPointsData?.matchingIssuesCount ?? 0;
  const labelPointsMatchingEstimatedIssuesCount = labelPointsData?.matchingEstimatedIssuesCount ?? 0;
  const burndownDistribution = filteredBurndown?.distribution;
  const hasBurndownDistribution = !!burndownDistribution && Object.keys(burndownDistribution).length > 0;
  const hasEstimatePoints = totalEstimatePoints > 0;
  const dateRangeLabel =
    cycle?.start_date && cycle?.end_date
      ? `${renderFormattedDateWithoutYear(cycle.start_date)} - ${renderFormattedDateWithoutYear(cycle.end_date)}`
      : "Dates not configured";
  const businessDaysUntilEnd = countBusinessDaysUntilEnd(cycleEndDate);
  const businessDaysUntilEndLabel = getBusinessDaysUntilEndLabel(cycleEndDate, businessDaysUntilEnd);

  useEffect(() => {
    const availableLabelSet = new Set(availableLabels.map((label) => label.id));
    setSelectedLabelIds((currentLabelIds) => currentLabelIds.filter((labelId) => availableLabelSet.has(labelId)));
  }, [availableLabels]);

  useEffect(() => {
    const availableAssigneeSet = new Set(cycleAssigneeIds);
    setSelectedAssigneeIds((currentIds) => currentIds.filter((id) => availableAssigneeSet.has(id)));
  }, [cycleAssigneeIds]);

  if (!cycle && isCycleLoading) {
    return (
      <>
        <PageHead title={pageTitle} />
        <div className="mx-auto flex h-full w-full max-w-5xl flex-col gap-6 py-6">
          <Loader className="space-y-3">
            <Loader.Item height="14px" width="96px" />
            <Loader.Item height="28px" width="260px" />
            <Loader.Item height="16px" width="420px" />
          </Loader>
          <Loader className="rounded-[10px] border border-custom-border-200 bg-custom-background-100 p-6 space-y-4">
            <Loader.Item height="16px" width="120px" />
            <Loader.Item height="24px" width="240px" />
            <Loader.Item height="16px" width="100%" />
            <Loader.Item height="16px" width="85%" />
            <Loader.Item height="180px" width="100%" />
          </Loader>
        </div>
      </>
    );
  }

  if (!cycle && didCycleFetchFail) {
    return (
      <>
        <PageHead title={pageTitle} />
        <EmptyState
          image={emptyCycle}
          title="Cycle does not exist"
          description="The cycle KPI page could not be opened because the cycle does not exist or has been deleted."
          primaryButton={{
            text: "View other cycles",
            onClick: () => router.push(`/${workspaceSlug}/projects/${projectId}/cycles`),
          }}
        />
      </>
    );
  }

  if (!cycle) return null;

  return (
    <>
      <PageHead title={pageTitle} />
      <div className="mx-auto flex h-full w-full max-w-5xl flex-col gap-6 py-6">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-custom-primary-100">Cycle KPI</p>
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold text-custom-text-100">{cycle.name}</h1>
            <p className="text-sm text-custom-text-300">
              The first KPI view shows a burndown chart based on estimate points, using the existing cycle analytics
              pipeline already available in the project cycle detail flow.
            </p>
          </div>
        </div>

        <section className="rounded-[10px] border border-custom-border-200 bg-custom-background-100 p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-custom-primary-100">Burndown KPI</p>
              <h2 className="text-lg font-semibold text-custom-text-100">Estimate-point burndown</h2>
              <p className="max-w-2xl text-sm text-custom-text-300">
                Remaining points are calculated from the sum of work-item estimates. In this first version, cancelled
                work items do not burn down the chart.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {(selectedLabelIds.length > 0 || selectedAssigneeIds.length > 0) && (
                <button
                  type="button"
                  className="flex items-center gap-1 border-custom-border-200 px-3 py-1 text-xs font-medium text-custom-text-200 transition-colors hover:text-custom-text-100"
                  onClick={() => {
                    setSelectedLabelIds([]);
                    setSelectedAssigneeIds([]);
                  }}
                >
                  <X className="h-3 w-3" />
                  Clear
                </button>
              )}
              <MemberDropdown
                value={selectedAssigneeIds}
                onChange={setSelectedAssigneeIds}
                projectId={projectId}
                placeholder="All users"
                multiple
                disabled={isFilterDataLoading || cycleAssigneeIds.length === 0}
                buttonClassName="rounded-md border border-custom-border-200 bg-custom-background-90 px-3 py-2 text-custom-text-100"
                buttonVariant="transparent-without-text"
                hideIcon
                button={
                  <div className="flex items-center gap-2">
                    <span className="max-w-[180px] truncate text-sm">{selectedAssigneesSummary}</span>
                    <ChevronDown className="h-3 w-3" />
                  </div>
                }
                optionsClassName="w-64"
              />
              <LabelDropdown
                projectId={null}
                value={selectedLabelIds}
                onChange={setSelectedLabelIds}
                defaultOptions={availableLabels}
                disabled={isFilterDataLoading || availableLabels.length === 0}
                label={
                  <div className="flex items-center gap-2">
                    <span className="max-w-[180px] truncate text-sm">{selectedLabelSummary}</span>
                  </div>
                }
                buttonClassName="rounded-md border border-custom-border-200 bg-custom-background-90 px-3 py-2 text-custom-text-100"
                optionsClassName="w-64"
              />
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between gap-3 rounded-[10px] border border-custom-border-200 bg-custom-background-90 px-4 py-3 text-sm text-custom-text-300">
            <span>
              {selectedLabels.length > 0 || selectedAssigneeIds.length > 0 ? "Filtered view" : "Showing all work items"}
            </span>
            <span>
              {availableLabels.length > 0
                ? `${availableLabels.length} label${availableLabels.length === 1 ? "" : "s"} available`
                : isFilterDataLoading
                  ? "Loading labels..."
                  : "No labels in this cycle"}
            </span>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-3">
            <KpiStat label="Business days left" value={businessDaysUntilEndLabel} />
            <KpiStat label="Cycle dates" value={dateRangeLabel} />
            <KpiStat label="Estimate scope" value={`${totalEstimatePoints} points`} />
          </div>

          <div className="mt-3 grid grid-cols-2 gap-3">
            <KpiStat label="Completed" value={`${completedEstimatePoints} points`} />
            <KpiStat label="Remaining" value={`${pendingEstimatePoints} points`} />
          </div>

          <div className="mt-6 rounded-[10px] border border-dashed border-custom-border-200 bg-custom-background-90 p-6">
            {!hasValidCycleDates ? (
              <div className="space-y-3">
                <p className="text-sm font-medium text-custom-text-100">Cycle dates are required for burndown.</p>
                <p className="text-sm text-custom-text-300">
                  The KPI route is available, but this cycle needs valid start and end dates before the estimate-point
                  burndown can be rendered.
                </p>
              </div>
            ) : isFilterDataLoading ? (
              <Loader className="space-y-3">
                <Loader.Item height="16px" width="220px" />
                <Loader.Item height="16px" width="100%" />
                <Loader.Item height="16px" width="75%" />
                <Loader.Item height="140px" width="100%" />
              </Loader>
            ) : didFilterDataFail ? (
              <div className="space-y-3">
                <p className="text-sm font-medium text-custom-text-100">Filter data could not be prepared.</p>
                <p className="text-sm text-custom-text-300">
                  The KPI route loaded successfully, but the client-side issue data required for filtering could not be
                  loaded.
                </p>
              </div>
            ) : (selectedLabelIds.length > 0 || selectedAssigneeIds.length > 0) && matchingIssuesCount === 0 ? (
              <div className="space-y-3">
                <p className="text-sm font-medium text-custom-text-100">No work items match the active filters.</p>
                <p className="text-sm text-custom-text-300">
                  Try a different filter combination or clear the filters to return to the full cycle burndown.
                </p>
              </div>
            ) : !hasEstimatePoints || matchingEstimatedIssuesCount === 0 ? (
              <div className="space-y-3">
                <p className="text-sm font-medium text-custom-text-100">No estimate points available yet.</p>
                <p className="text-sm text-custom-text-300">
                  {selectedLabelIds.length > 0 || selectedAssigneeIds.length > 0
                    ? "The selected filters do not have any estimated work items available for the burndown chart."
                    : "Add estimates to the cycle work items to generate the first burndown view for this KPI screen."}
                </p>
              </div>
            ) : hasBurndownDistribution && burndownDistribution ? (
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-custom-text-100">Burndown chart</p>
                  <p className="text-sm text-custom-text-300">
                    {selectedLabelIds.length > 0 || selectedAssigneeIds.length > 0
                      ? "Based only on estimate points from work items that match the active filters."
                      : "Based only on estimate points from completed work items for this release."}
                  </p>
                </div>
                <KpiBurndownChart
                  distribution={burndownDistribution}
                  totalEstimatePoints={totalEstimatePoints}
                  className="min-h-[370px]"
                />
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm font-medium text-custom-text-100">Burndown data is not available.</p>
                <p className="text-sm text-custom-text-300">
                  The KPI route loaded successfully, but the estimate-point burndown payload could not be rendered for
                  this cycle.
                </p>
              </div>
            )}
          </div>
        </section>

        <section className="rounded-[10px] border border-custom-border-200 bg-custom-background-100 p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-custom-primary-100">Label KPI</p>
              <h2 className="text-lg font-semibold text-custom-text-100">Points by label</h2>
              <p className="max-w-2xl text-sm text-custom-text-300">
                This chart groups estimate points by label and follows the same member filter used in Burndown KPI.
              </p>
            </div>

            <div className="rounded-md border border-custom-border-200 bg-custom-background-90 px-3 py-2 text-sm text-custom-text-300">
              {selectedAssigneeIds.length > 0 ? `Members: ${selectedAssigneesSummary}` : "Members: All users"}
            </div>
          </div>

          <div className="mt-6 rounded-[10px] border border-dashed border-custom-border-200 bg-custom-background-90 p-6">
            {isFilterDataLoading ? (
              <Loader className="space-y-3">
                <Loader.Item height="16px" width="240px" />
                <Loader.Item height="16px" width="100%" />
                <Loader.Item height="140px" width="100%" />
              </Loader>
            ) : didFilterDataFail ? (
              <div className="space-y-3">
                <p className="text-sm font-medium text-custom-text-100">Label points could not be prepared.</p>
                <p className="text-sm text-custom-text-300">
                  The KPI route loaded, but issue data required to build the points-by-label chart is unavailable.
                </p>
              </div>
            ) : selectedAssigneeIds.length > 0 && labelPointsMatchingIssuesCount === 0 ? (
              <div className="space-y-3">
                <p className="text-sm font-medium text-custom-text-100">No work items match the selected members.</p>
                <p className="text-sm text-custom-text-300">
                  Update the member selection or clear filters to view points grouped by label.
                </p>
              </div>
            ) : labelPointsMatchingEstimatedIssuesCount === 0 ? (
              <div className="space-y-3">
                <p className="text-sm font-medium text-custom-text-100">No estimate points available yet.</p>
                <p className="text-sm text-custom-text-300">
                  {selectedAssigneeIds.length > 0
                    ? "The selected members do not have estimated work items in this cycle yet."
                    : "Add estimates to cycle work items to render points grouped by label."}
                </p>
              </div>
            ) : labelPointsChartData.length > 0 ? (
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-custom-text-100">Points by label chart</p>
                  <p className="text-sm text-custom-text-300">
                    {selectedAssigneeIds.length > 0
                      ? "Only estimated work items assigned to the selected members are included."
                      : "All estimated work items in the cycle are included."}
                  </p>
                </div>
                <KpiLabelPointsChart data={labelPointsChartData} className="min-h-[350px]" />
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm font-medium text-custom-text-100">Label points data is not available.</p>
                <p className="text-sm text-custom-text-300">
                  The KPI route loaded, but the points-by-label chart could not be rendered for this cycle.
                </p>
              </div>
            )}
          </div>
        </section>
      </div>
    </>
  );
});
